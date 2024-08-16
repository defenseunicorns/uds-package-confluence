# Atlassian Confluence Node Clustering in Kubernetes

**Status:** Clustering works in Kubernetes _only_ if you disable Istio injection. Note that Big Bang also 
[disables Istio](https://repo1.dso.mil/big-bang/product/community/confluence/-/blob/7a6569baedd147b3b09620beb4ea9cb917e0b88d/chart/values.yaml#L1642) for their confluence deployment.

## Enabling Clustering

If you wish to enable clustering, consider the following steps and decisions to be made:

1. Search for `# If clustering, make true` and make the suggested change. This can't be handled through a Zarf var because Zarf vars only handle strings, and `"false"` is truthy as `true` in helm.
2. Search for that variable, and then understand the helm values it is setting, to get an idea what is created for an Istio-injected clustering scenario (which does not work).
3. Decide to go forward with Istio - in this case you'll need to find a way to get it to work, or without Istio.

There are a number of challenges involved in Confluence clustering. You'll get to the current status if you:

- Install with just one replica
- Move through the setup wizard
- Increase replication to 2 _only after_ you've finished setup on Node-0.
- Tail the logs from poth nodes (pods `confluence-1` and `confluence-2`), note that `confluence-2` will error out after failing cluster authentication.

Moving forward, you can go with or without Istio.

### Clustering w/ Istio

If you choose to cluster with Istio, you have the following **advantages:**

1. There is a [Istio Destination Rule](chart/templates/destination-rule.yaml) to provide sticky sessions. This should load-balance across the nodes fairly evenly as it can load-balance on a per-user basis (unlike ClientIP based 
session affinity. See discussion of challenges with the w/o Istio approach).
2. You enjoy the full security of a typical UDS setup and easily connect into the larger ecosystem in the ways expected.

**Challenges**:

1. The confluence nodes (pods) want to speak to each other in terms of bare IP addresses instead of pod-names, which are DNS host names resolvable in-cluster. Istio does not "like" pods doing this, and it is suspected to be a 
contributing factor to the inability of the clustering to work with Istio. Note, Hazelcast as built into Confluence is using K8s API based node discovery. 
[This is one of two Hazelcast supported methods](https://docs.hazelcast.com/hazelcast/latest/kubernetes/kubernetes-auto-discovery#discovering-members). It could also find other nodes by resolving their DNS pod names to an IP. If in 
this mode Hazelcast would be sending messages to `confluence-0` instead of `10.42.0.36`, it might play better with Istio. Injecting Hazelcast settings to alter the node discovery method and/or further work on Istio Destination 
Rules are offered as two approaches that might lead to success.

This url may also help resolve the pod-IP access problem: <https://discuss.istio.io/t/istio-mtls-and-pod-ip-port/7537>.

### Clustering w/o Istio

If you choose to cluster without Istio injection enabled, you have the following **advantages:**

1. You're operating in the set of circumstances where clustering has been known to work.

**Challenges**:

1. Without some other proxy/load-balancer added in, you're stuck with ClientIP based session affinity. In an on-prem scenario, this could lead to massive portions of the load all being sent to the same pod for reason of 1/2 or even 
all the users being behind a common proxy (one visible `ClientIP` if you're the K8s CNI plugin). Alternatively, you can use a [Headless Service](https://kubernetes.io/docs/concepts/services-networking/service/#headless-services) 
and an external load-balancer to route the load to the pods. If you use a typical `ClusterIP` style service, it will round-robin each request across the pods destroying user's ability to do anything as each change in backend pod 
resets their application to the starting state.
2. It's unknown to this writer whether or not you'd be able to use the Istio Virtual Service to expose Confluence. If not, you'll need to bring something else in like an Nginx Ingress controller.
3. Anything else Confluence speaks to in-cluster will need `PERMISSIVE` settings to receive your communications degrading the cluster's overall security posture.
4. UDS does not (as of this writing) have a "disable Istio" setting. This means you'll need to deploy confluence as a non-UDS package (remove the UDS-package resource from `chart/templates`), set Istio injection to disabled in the 
namespace, and provide your own ingress if Istio Virtual Services do not work without Istio injection (I don't know).

Experimentally, this was shown to work. To convert an existing Istio-based install to a non-Istio install take the following steps:

- Delete the `confluence` `package` from the cluster. This `package` resource causes the UDS Operator in Pepr to enforce Istio injection rules in the `confluence` `namespace`.
- Edit the `confluence namespace` to be labeled: `istio-injection: disabled`.
- Setup a PeerAuthentication policy for postgre to so mTLS is `PERMISSIVE`.
- Scale down the `confluence statefulset` to 0. This will remove the pods with Istio injected.
- Scale the the `confluence statefulset` back to 1, and then when 1 is running (and you've completed the setup wizard), to 2.

Inspect the confluence pods, they should not have the Istio sidecars, and provided they're able to access the postgre db, they should quickly form a cluster of two.

Do not use these steps as-is for configuring a production environment. If using this in production, alter the IaC so you are deploying from yaml what was reached imperatively here. This is just for easy testing to see that 
clustering works without Istio.
