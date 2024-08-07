The TCP/IP approach doesn't work:
    - IPs are not static to the replicas, so when you scale down the old IP is lost.
    - If you start with just one replica, and then try to add a second one later, your traffic keeps getting redirected to the wrong node on and off breaking your workflows.

To enable a cluster of one:
1. Enable clustering
2. Use TCP/IP and put in the single pod's IP
3. Enter the shared home directory from the common-values file into the UI.

If the statefulset is ever scaled down, the IP will need updated in the confluence.cfg.xml file.


## Upgrade to Clustered Configuration

1. Change the `service` type from `ClusterIP` to `None` in the values.yaml file. The [statefulset requires you](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#limitations) to create a [headless service](https://kubernetes.io/docs/concepts/services-networking/service/#headless-services) to prevent round-robin load-balancing from destroying your stateful access.
2. Delete the existing `Confluence` service because these 

If you are reinstalling and losing all existing IPs on a cluster, you must wipe the PVCs and PVs or update the IPs. Else it won't come up.


-----

Trying again with None service type


-----------

JSESSIONID

```
sh
kubectl apply -f my-statefulset-service.yaml
kubectl apply -f my-statefulset-destinationrule.yaml
kubectl apply -f my-statefulset-virtualservice.yaml

### Example Configuration Files

Here are the complete example configuration files:

**my-statefulset-service.yaml**:

apiVersion: v1
kind: Service
metadata:
  name: my-statefulset
  labels:
    app: my-statefulset
spec:
  ports:
  - port: 80
    name: http
  clusterIP: None
  selector:
    app: my-statefulset

**my-statefulset-destinationrule.yaml**:

apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: confluence-destination-rule-for-stateful-balancing
spec:
  host: confluence.confluence.svc.cluster.local
  trafficPolicy:
    loadBalancer:
      consistentHash:
        httpCookie:
          name: istio-session-id-confluence
          ttl: 0s

**my-statefulset-virtualservice.yaml**:

apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: my-statefulset
spec:
  hosts:
  - my-statefulset.example.com
  gateways:
  - my-gateway
  http:
  - route:
    - destination:
        host: confluence.confluence.svc.cluster.local
        port:
          number: 80
```



------ you may need to delete the pod a while later to get it to all work.