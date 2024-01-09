# uds-capability-confluence
Bigbang [Confluence](https://repo1.dso.mil/big-bang/product/community/confluence) deployed via flux by zarf

## Deployment Prerequisites

### Resources
- Minimum compute requirements for single node deployment are at LEAST 64 GB RAM and 32 virtual CPU threads (aws `m6i.8xlarge` instance type should do)
- k3d installed on machine

#### General

- Create `confluence` namespace
- Label `confluence` namespace with `istio-injection: enabled`

#### Database

- A Postgres database is running on port `5432` and accessible to the cluster
- This database can be logged into via the username configured with the zarf var `CONFLUENCE_DB_USERNAME`. Default is`confluence`
- This database instance has a psql database created configured with the zarf var `CONFLUENCE_DB_NAME`. Default is `confluencedb`
- The user has read/write access to the above mentioned database
- Create `confluence-postgres` service in `confluence` namespace that points to the psql database
- Create `confluence-postgres` secret in `confluence` namespace with the key `password` that contains the password to the user for the psql database
## Deploy

### Use zarf to login to the needed registries i.e. registry1.dso.mil

```bash
# Download Zarf
make build/zarf

# Login to the registry
set +o history

# registry1.dso.mil (To access registry1 images needed during build time)
export REGISTRY1_USERNAME="YOUR-USERNAME-HERE"
export REGISTRY1_TOKEN="YOUR-TOKEN-HERE"
echo $REGISTRY1_TOKEN | build/zarf tools registry login registry1.dso.mil --username $REGISTRY1_USERNAME --password-stdin

set -o history
```

### Build and Deploy Everything via Makefile and local package

```bash
# This will run make build/all, make cluster/reset, and make deploy/all. Follow the breadcrumbs in the Makefile to see what and how its doing it.
make all
```

## Declare This Package In Your UDS Bundle
Below is an example of how to use this projects zarf package in your UDS Bundle

```yaml
kind: UDSBundle
metadata:
  name: example-bundle
  description: An Example UDS Bundle
  version: 0.0.1
  architecture: amd64

packages:
  - name: confluence
    repository: ghcr.io/defenseunicorns/uds-capability/confluence
    ref: x.x.x
```