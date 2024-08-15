# Troubleshooting Help

This is a list of error messages and the information used to fix them previously.

## Spring Application context has not been set

**Webpage error**. Tab title is: "Oops - an error has occured".

> **[logo]** System Error
> A system error has occurred — our apologies!
> 
> For immediate troubleshooting, consult our knowledge base for a solution.
> 
> If you would like to receive support from Atlassian's support team, ask your Confluence administrator to create a support issue on Atlassian's support system with the following information:
> 
> a description of your problem and what you were doing at the time it occurred
> a copy of the error and system information found below
> a copy of the application logs (if possible).
> Your Confluence administrator can use the support request form to create a support ticket which will include this information.
> 
> We will respond as promptly as possible.
> Thank you!
> 
> Return to site homepage…
> 
> The SystemInformationService could not be retrieved from the container. Therefore very limited information is available in this error report.
> The SystemInformationService could not be retrieved due to the following error: java.lang.IllegalStateException: Spring Application context has not been set
> Cause
> Exception ID: 1eb0b51e-d342-4603-ac61-3d42a39f1109
> 
> Referer URL
> Unknown

This confluence document explains the potential causes: <https://confluence.atlassian.com/confkb/confluence-does-not-start-due-to-spring-application-context-has-not-been-set-218278311.html>. There are 12.

### Incident Aug 8, 2024

I deployed the bundle, saw it succeeded but was missing the clusterrole, so I added the clusterrole and binding and then restarted the pod. I suspect this resulted in cause #12 from the above link: _restarting part way through the Setup Wizard_.

To fix, I erased the namespaces for Confluence and the Postgre DB, then redeployed. Be forwarned, in production clusters the confluence namespace may hang during deletion due to a finalizer. After leaving it alone for 24 hours it eventualy finished deleting.

## "Set up error"

This cccurs during Setup Wizard in the Web UI. See confluence doc: <https://community.atlassian.com/t5/Confluence-questions/Got-quot-Set-up-step-error-quot-after-going-back-a-step/qaq-p/685763>

### Incident Aug 8, 2024 #2

Seemed to happen because I accessed the new install at the URL auto-filled by the browser, which may have skipped a setup step or caused them to execute out of order. Either way, it can cause the "Set up error.

To avoid: only access confluence by it's boring base URL during setup. During development, that'd be <https://confluence.uds.dev>.

To fix: I shelled into the container, deleted `confluence.cfg.xml` as recommended in the above URL and restarted the pod. It took a while to start up, but worked. Going straight to that base URL as suggested above avoided a repeat "Set up error".

## Hazelcast instance is not active - trying to scale up from 1

This problem has not been totally resolved. If you remove Istio injection from the namespace entirely, and enable clustering via the Zarf var, it should work. If Istio injection is enabled, some quasi-fixes have been found but it never actually is able to form a cluster. See [docs/clustering.md](docs/clustering.md) for the full write up.

## ZONE_AWARE feature is disabled

This is a log message:

```txt
Cannot fetch the current zone, ZONE_AWARE feature is disabled
```

It is not a problem. Per https://github.com/hazelcast/hazelcast-kubernetes/issues/196 it should've been downgraded to "info" not "warning" anyway.

If you attempt to fix it per these instructions: <https://confluence.atlassian.com/confkb/confluence-unable-to-locate-hazelcast-members-after-adding-outbound-http-https-proxy-to-kubernetes-deployment-1387866874.html>
by adding `-Dhttp.nonProxyHosts='confluence.uds.dev|kubernetes.default.svc'` to the java args it'll make no difference. We don't have a proxy issue causing this.
