# Atlassian Confluence Node Clustering in Kubernetes

The Atlassian products were not made for the containerized Kubernetes world. These Java applications date from the first half of the 2000s, and are stateful. In kubernetes, they're a statefulset. This complicates horizontal scaling.

In a made-for-k8s or cloud-native application, each "server instance" or container runs statelessly with the stateful info cached somewhere like Redis. This means a client's requests can be served by multiple different backends without
inconsistency in the final result. In this case, scaling is simple. Duplicate the pods and let k8s load-balance across them.

## Sticky Sessions

Because Confluence is a stateful application (like most if not all the other Atlassian products), every request from a client must go to the same cluster node. If a client's traffic is diverted to a different node, they'll have to restart the whole conversation or workflow. This requires Sticky Sessions.

The [Confluence Helm Chart values](https://github.com/atlassian/data-center-helm-charts/blob/main/src/main/charts/confluence/values.yaml#L560)
`confluence.service.sessionAffinity` and `confluence.service.sessionAffinityConfig` allow us to setup [ClientIP based session affinity.](https://kubernetes.io/docs/reference/networking/virtual-ips/#session-affinity)
This tells the k8s proxy which performs service routing to send all traffic from a given client IP address to the same pod. We don't use this
feature for two reasons:

1. This affinity is based on the _visible_ client IP. If a sizable portion of the user-base is behind a proxy, all those users will have the
same clientIP. Consequently, they will all go to the same pod. This provides consistent state but risk significant load-balancing problems.
2. It is possible for a user to change their IP part way through a session, say someone on their cellphone switching from airport wifi to cellular.
This too would cause the clientIP based session affinity to not preserve state and potentially put the user on a new pod.

Instead of ClientIP based session affinity, we're using an Istio Destination Rule to re-route packets at the side-car level after they've reached
the destination pod assigned to them by k8s round-robin load-balancing. Istio reroutes the traffic based on the session cookie. This preserves state
while allowing us to load-balance on a per-user basis.

Per the [K8s documentation]((https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#limitations)),
if you're using a statefulset with replication, you need to use a [headless service](https://kubernetes.io/docs/concepts/services-networking/service/#headless-services)
to prevent round-robin load-balancing from destroying your stateful access. The Confluence Helm Chart doens't expose this option,
and we don't need it. That's because Istio's Destination Rule based routing happens after the k8s service routing. So, though
k8s is routing the traffic as though this were a stateless app, that's not an issue because Istio fixes it afterwards.

We could turn on ClientIP based session affinity in an attempt to reduce the frequency with which Istio has to re-route a packet. In the event all the users
are behind the same proxy, however, this could cause a single Istio side-car to be responsible for re-routing all user traffic. I think it's more robust
to accept the constant cost of Istio re-routing instead though some users, depending on their network topology, may want to turn it on.

## Clustering

The big thing to understand about Confluence node clusters in Kubernetes is that we aren't using any of the clustering options which show up on the server setup-page
after install. We don't use TCP/IP, that fails because IPs change all the time. We don't use Multicast, that only works with specific CNIs. We don't use the AWS based
option because we're in Kubernetes. Confluence uses [HazelCast](https://docs.hazelcast.com/home/) to automatically build the cluster if the Helm Values are properly configured.

Hazelcast comes as a Java dependency baked into Confluence. If enabled, it runs as a parallel service in the container. To turn it on:

1. Set the sharedHome PVC to be created
1. Enable the creation of a service account. Hazelcast needs that to talk to the k8s API to discover nodes.
1. Enable the hazelcast service
1. Enable clustering


Here's the relevant excerpt from a values.yaml file:

```yaml
volumes:
  sharedHome:
    persistentVolumeClaim:
      create: true
serviceAccount:
  create: true
  role:
    create: true
confluence:
  hazelcastService:
    enabled: true
  clustering:
    enabled: true
```

With this done, you can deploy a single node cluster first, and then once it comes up and is working, expand it _one node at a time_ by scaling up the replica count for the statefulset.

If everything is setup correctly you will never be asked in the UI on server startup whether
this should be configured as a standalone node or cluster.
