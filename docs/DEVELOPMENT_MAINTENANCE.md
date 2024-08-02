# UDS Confluence Package

This package is pulling in the [upstream confluence chart](https://github.com/atlassian/data-center-helm-charts/tree/main/src/main/charts/confluence)

## How to upgrade this package

To upgrade:

1) Point `application.ref.tag` to the updated version of the chart.
2) Update any base values if necessary.
3) Update the `confluence` component in the [zarf.yaml](../zarf.yaml) file to pull in the correct images needed for the updated version of the chart.

## How to test this package on your own cluster

1) Have a cluster running that has [UDS-Core](https://github.com/defenseunicorns/uds-core) and you have access to it
2) Clone this repo to your local machine
3) Migrate to the cloned repo
4) Using `uds-cli` run the `dev` task in the repo. The task will build the current configuration in the repo and then deploy it to the cluster
    - Example command: `uds run dev --set FLAVOR=<your-desired-flavor-here>`

## Creating Releases

This project uses [release-please-action](https://github.com/google-github-actions/release-please-action) for versioning and releasing OCI packages.

### How should I write my commits?

Release Please assumes you are using [Conventional Commit messages](https://www.conventionalcommits.org/).

The most important prefixes you should have in mind are:

- `fix:` which represents bug fixes, and correlates to a [SemVer](https://semver.org/)
  patch.
- `feat:` which represents a new feature, and correlates to a SemVer minor.
- `feat!:`,  or `fix!:`, `refactor!:`, etc., which represent a breaking change
  (indicated by the `!`) and will result in a SemVer major.

When changes are merged to the `main` branch, the Release Please will evaluate all commits since the previous release to calculate what changes are included and will create another PR to increase the version and tag a new release (per the Release Please design [documentation](https://github.com/googleapis/release-please/blob/main/docs/design.md#lifecycle-of-a-release)). This will also automatically generate changelog entries based on these commits.

> TIP: Merging a PR should be done via a branch **"Squash and merge"**; this means that the commit message seen on this PR merge is what Release Please will use to determine a version bump.

When the auto generated Release Please PR is merged the following steps will automatically happen.

1) A new release will be created and tagged
2) New artifact(s) will be published to the OCI registry
