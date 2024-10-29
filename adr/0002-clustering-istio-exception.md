# 0002. Clustering for Atlassian products

Date: 21 October 2024

## Status

**STATUS** Accepted

## Context

Per Atlassian documentation, Istio interferes with Atlassian products' ability to function properly, especially when running the programs in a clustered scenario. Some issues that arise when more than one instance in the cluster is present include session loss, login loops, data loss, etc.

### Attempted Solutions

- Disable PeerAuthentication in the Istio sidecar: The idea behind this solution was to prevent Istio from encrypting the traffic between the instances. However, this traffic still passes through Istio, which disrupts clustering.
- Remove Istio entirely from the namespace: This solution eliminates all encryption of traffic within the namespace, allowing multiple instances to communicate freely and function properly. However, this approach compromises traffic security and is not ideal from a security standpoint.
- Add PodAnnotations to exclude specific inbound/outbound ports: By using annotations such as traffic.sidecar.istio.io/excludeOutboundPorts: 40001,40011, Istio remains in the namespace but does not interfere with instance-to-instance traffic. This solution enabled full clustering functionality for the instances.
- Forego clustering and allocate maximum resources to a single instance.

## Decision

Since the customer will eventually have 1000+ users, a single Jira or Confluence node will not be sufficient. Clustering is, therefore, a must-have requirement. As such, we have decided to proceed with Solution #3.

## Consequences

Excluding specific ports from Istio, rather than removing it entirely, is the least disruptive way to mitigate risk while maintaining full functionality. This approach, combined with a DestinationRule to manage session cookies, allows the end user to leverage clustering while keeping the instances within the service mesh.
