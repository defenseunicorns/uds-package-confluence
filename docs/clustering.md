The TCP/IP approach doesn't work:
    - IPs are not static to the replicas, so when you scale down the old IP is lost.
    - If you start with just one replica, and then try to add a second one later, your traffic keeps getting redirected to the wrong node on and off breaking your workflows.

To enable a cluster of one:
1. Enable clustering
2. Use TCP/IP and put in the single pod's IP
3. Enter the shared home directory from the common-values file into the UI.

If the statefulset is ever scaled down, the IP will need updated in the confluence.cfg.xml file.
