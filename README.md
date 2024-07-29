# 🚚 UDS Confluence Zarf Package

[![Latest Release](https://img.shields.io/github/v/release/defenseunicorns/uds-package-confluence)](https://github.com/defenseunicorns/uds-package-confluence/releases)
[![Build Status](https://img.shields.io/github/actions/workflow/status/defenseunicorns/uds-package-confluence/tag-and-release.yaml)](https://github.com/defenseunicorns/uds-package-confluence/actions/workflows/tag-and-release.yaml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/defenseunicorns/uds-package-confluence/badge)](https://api.securityscorecards.dev/projects/github.com/defenseunicorns/uds-package-confluence)

This package is designed to be deployed on [UDS Core](https://github.com/defenseunicorns/uds-core), and is based on the registry1 [Confluence](https://repo1.dso.mil/big-bang/product/community/confluence/-/tree/main/chart?ref_type=heads) chart.

## Pre-requisites

The Confluence Package expects to be deployed on top of [UDS Core](https://github.com/defenseunicorns/uds-core) with the dependencies listed below being configured prior to deployment.

Confluence is configured by default to assume the internal dependencies that are used for testing (see postgres in the [bundle](bundle/uds-bundle.yaml)).

#### Database

- A Postgres database is running on port `5432` and accessible to the cluster via the `CONFLUENCE_DB_ENDPOINT` Zarf var.
- This database can be logged into via the username configured with the Zarf var `CONFLUENCE_DB_USERNAME`. Default is `confluence.confluence`
- This database instance has a psql database created matching what is defined in the Zarf var `CONFLUENCE_DB_NAME`. Default is `confluencedb`
- The user has read/write access to the above mentioned database
- Create `confluence-postgres` service in `confluence` namespace that points to the psql database
- Create `confluence-postgres` secret in `confluence` namespace with the key `password` that contains the password to the user for the psql database

## Flavors

| Flavor | Description | Example Creation |
| ------ | ----------- | ---------------- |
| registry1 | Uses images from registry1.dso.mil within the package. | `zarf package create . -f registry1` |

> [!IMPORTANT]
> **NOTE:** To create the registry1 flavor you will need to be logged into Iron Bank - you can find instructions on how to do this in the [Big Bang Zarf Tutorial](https://docs.zarf.dev/tutorials/6-big-bang/#setup).

## Releases

The released packages can be found in [ghcr](https://github.com/defenseunicorns/uds-package-confluence/pkgs/container/packages%2Fuds%2Fconfluence).

## UDS Tasks (for local dev and CI)

*For local dev, this requires you install [uds-cli](https://github.com/defenseunicorns/uds-cli?tab=readme-ov-file#install)

> [!TIP]
> To get a list of tasks to run you can use `uds run --list`!

## Contributing

Please see the [CONTRIBUTING.md](./CONTRIBUTING.md)

## TODO

       •  Processing helm chart uds-confluence-config:0.1.0 from chart                                                                                                                                                                                                               
       •  Processing helm chart uds-confluence-config:0.1.0 from chart                                                                                                                                                                                                               
       •  Processing helm chart confluence                                                                                                                                                                                                                                           
                                                                                                                                                                                                                                                                                     
      WARNING  no repository definition for https://atlassian.github.io/data-center-helm-charts,                                                                                                                                                                                     
               https://charts.bitnami.com/bitnami, https://opensearch-project.github.io/helm-charts.                                                                                                                                                                                 
               Please add the missing repo(s) via the following:                                                                                                                                                                                                                     
     $ zarf tools helm repo add <your-repo-name> https://atlassian.github.io/data-center-helm-charts                                                                                                                                                                                 
     $ zarf tools helm repo add <your-repo-name> https://charts.bitnami.com/bitnami                                                                                                                                                                                                  
     $ zarf tools helm repo add <your-repo-name> https://opensearch-project.github.io/helm-charts                                                                                                                                                                                    
                                                                                                                          