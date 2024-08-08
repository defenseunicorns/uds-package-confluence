# Troubleshooting Help

This is a list of error messages and the information used to fix them previously.

## Spring Application context has not been set

**Webpage error**. Tab title is: "Oops - an error has occured".

> logo System Error
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

I deployed the bundle, saw it succeeded but was missing the clusterrole, so I added the clusterrole and binding then restarted the pod. That caused this error.

I suspected error #12, restarting part way through the Setup Wizard so erased the namespaces for Confluence and the Postgre DB, then redeployed. 

## Set up error

Occurs during Setup Wizard in the Web UI. See confluence doc: <https://community.atlassian.com/t5/Confluence-questions/Got-quot-Set-up-step-error-quot-after-going-back-a-step/qaq-p/685763>

### Incident Aug 8, 2024 #2

Seemed to happen because I accessed the new install at the URL auto-filled by the browser, which may have skipped a setup step. So, only access it at <https://confluence.uds.dev>.

I shelled into the container, deleted `confluence.cfg.xml` as recommended and restarted the pod. It took a while to start up, but worked. Going straight to that URL seems to have avoided a repeat error.

## Hazelcast instance is not active - trying to scaleup from 1

After starting a second node, `node-1` (vs `node-0`), it creates a cluster of 1, and if you wait about a few minutes, `node-0` dies to a miserable death of repeated java stack traces like this:

```txt
08-Aug-2024 16:45:16.520 SEVERE [http-nio-8090-exec-7] org.apache.catalina.core.StandardHostValve.custom Exception Processing [ErrorPage[errorCode=500, location=/500page.jsp]]
	org.springframework.transaction.CannotCreateTransactionException: Could not open Hibernate Session for transaction; nested exception is com.hazelcast.core.HazelcastInstanceNotActiveException: Hazelcast instance is not active!
		at org.springframework.orm.hibernate5.HibernateTransactionManager.doBegin(HibernateTransactionManager.java:600)
		at com.atlassian.confluence.impl.hibernate.ConfluenceHibernateTransactionManager.doBegin(ConfluenceHibernateTransactionManager.java:31)
		at org.springframework.transaction.support.AbstractPlatformTransactionManager.startTransaction(AbstractPlatformTransactionManager.java:400)
		at org.springframework.transaction.support.AbstractPlatformTransactionManager.getTransaction(AbstractPlatformTransactionManager.java:373)
		at jdk.internal.reflect.GeneratedMethodAccessor213.invoke(Unknown Source)
		at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
		at java.base/java.lang.reflect.Method.invoke(Method.java:569)\
        ...
	Caused by: com.hazelcast.core.HazelcastInstanceNotActiveException: Hazelcast instance is not active!
		at com.hazelcast.instance.HazelcastInstanceProxy.getOriginal(HazelcastInstanceProxy.java:321)
		at com.hazelcast.instance.HazelcastInstanceProxy.getCluster(HazelcastInstanceProxy.java:219)
		at jdk.internal.reflect.GeneratedMethodAccessor123.invoke(Unknown Source)
		at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
		at java.base/java.lang.reflect.Method.invoke(Method.java:569)
		at org.springframework.aop.support.AopUtils.invokeJoinpointUsingReflection(AopUtils.java:344)
		at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:234)
		...
```

If you restart `node-0` it'll recreate a cluster of 1, and then `node-1` will die in similar fashion after a few moments.

### Incident Aug 8, 2024 #3

<https://community.atlassian.com/t5/Confluence-questions/Node02-unable-to-join-cluster-after-upgrade-from-7-13-0-to-7-13/qaq-p/2056253> recommended checking that the authentication settings to the cluster were the same
between the pods, they were.

<https://confluence.atlassian.com/stashkb/stash-become-unresponsive-with-hazelcast-instance-is-not-active-726369931.html> suggested an OOM error, that wasn't the problem. I confirmed by observing the memory requests during
a repeat of this error and it never went above 2G with a 6G limit. Also, I grepped `logs/atlassian-log.log` for "OutOfMemory" and it returned nothing.

I suspect this is related to errors I'm seeing earlier on from Hazelcast during the initial startup.

I added the java args Hazelcast was requesting and while that prevented that warning, it didn't fix it.

[This guy](https://github.com/atlassian/data-center-helm-charts/issues/224) seemed to have exactly the same problem. Atlassian's guess was that it was an issue with the cluster.

