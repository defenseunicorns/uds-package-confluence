# Configuration for Confluence

## High Availability

Confluence Clustering has been functional since [v8.5.16-uds.0](https://github.com/defenseunicorns/uds-package-confluence/releases/tag/v8.5.16-uds.0) released October 29th, 2024.

### 1. Enable Clustering

To enable clustering, set the following values in your UDS `bundle.yaml`:

```yaml
packages:
  - name: confluence
    overrides:
      uds-confluence-config:
        uds-confluence-config:
          values:
            - path: clustering.enabled
              value: true
      confluence:
        confluence:
          values:
            # Below are values to enable clustering
            - path: confluence.hazelcastService.enabled
              value: true # Set to true to enable clustering
            - path: confluence.clustering.enabled
              value: true # Set to true to enable clustering
          variables: 
            - name: CONFLUENCE_REPLICAS
              path: confluence.replicaCount
              default: 1  # Do not increase this until step 3 below   
```

Enabling clustering in the `uds-confluence-config` chart causes additional network policies/rules to be created providing things like [cookie-based session affinity through an Istio Destination Rule](../chart/templates/destinationrule.yaml#12) and permission for the Confluence pods to query the KubeAPI so they can locate and talk to each-other.

### 2. Deploy Confluence

If this is a new Confluence instance, install with just one replica, and complete the setup wizard before moving on to the next step. Enabling clustering _and_ getting more than one replica running before the setup wizard has completed will break the instance.

If this is not a new confluence instance, we still recommend waiting to scale until you've confirmed your pre-existing single confluence instance has stabilized following the upgrade.

### 3. Scale Confluence, _one replica at a time_

It is crucial that only one replica is added to confluence at a time, and that those replicas are turned off highest-ordinal-replica first when performing maintenance.

1. Increment the value of the variable `CONFLUENCE_REPLICAS` in your UDS configuration file.
2. Deploy your bundle, (you may use add the `-p confluence` flag to save time).
3. Return to step 1 above until you've reached the desired number of replicas.

Alternately, you can scale it manually via kubectl `kubectl scale -n confluence statefulset confluence --replicas X`.

### Upgrading Clustered Confluence

Confluence is very sensitive to nodes turning off or turning on in any order other than 0, 1, 2, 3 if turning on and 3, 2, 1, 0 if turning off. Fortunately, this is the default behavior for a K8s statefulset during a scaling action. If upgrading Confluence:

1. Scale Confluence down to 1 replica.
2. Deploy the bundle update.
3. Scale Confluence back up as described above.

If you skip step 1, Kubernetes will replace the highest-ordinal pod, then the next lowest, and so on down. This will cause higher ordered pods to be running while lower-ordered pods are dying and updating. This _might_ work, but is not tested, and goes contrary to this author's recollection of the Confluence documentation.
