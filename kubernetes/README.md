# Kubernetes auction-ui

This folder contains the kubernetes related setup for auction-ui.

## Development Setup

In order to develop and target a cluster locally, we use `k3d`. `k3d` is a container based dev-cluster that is related to `k3s`, a minimal, fully compliant kubernetes cluster implementation.

To develop this projects helm chart cluster deployment:
- setting up the cluster: [install k3d](https://k3d.io/#installation)
- deploying the application: [install helm](https://helm.sh/docs/intro/install/)
- interacting with the deployment: [install kubectl](https://kubernetes.io/docs/tasks/tools/) and/or [k9s](https://github.com/derailed/k9s#installation)

It is also assumed that you have installed docker.

In the setup that is created here, all port `80` applications will be accessible at port `8080` on `localhost`.

Once you've installed the above tools, run the following command _from this folder_:
```sh
> ./dev-cluster/deploy.sh
WARN[0000] No node filter specified
INFO[0000] Prep: Network
INFO[0000] Created network 'k3d-dev-cluster' (7001241b702b8c0f6b129cadd5e64d2961df61076b91a0794817cb50b4fb366d)
INFO[0000] Created volume 'k3d-dev-cluster-images'
INFO[0001] Creating node 'k3d-dev-cluster-server-0'
INFO[0001] Creating LoadBalancer 'k3d-dev-cluster-serverlb'
INFO[0001] Starting cluster 'dev-cluster'
INFO[0001] Starting servers...
INFO[0001] Starting Node 'k3d-dev-cluster-server-0'
INFO[0007] Starting agents...
INFO[0007] Starting helpers...
INFO[0007] Starting Node 'k3d-dev-cluster-serverlb'
INFO[0023] (Optional) Trying to get IP of the docker host and inject it into the cluster as 'host.k3d.internal' for easy access
INFO[0024] Successfully added host record to /etc/hosts in 2/2 nodes and to the CoreDNS ConfigMap
INFO[0024] Cluster 'dev-cluster' created successfully!
INFO[0024] --kubeconfig-update-default=false --> sets --kubeconfig-switch-context=false
INFO[0024] You can now use it like this:
kubectl config use-context k3d-dev-cluster
kubectl cluster-info
# Undeploy the cluster once you're done:
>  ./dev-cluster/undeploy.sh
INFO[0000] Deleting cluster 'dev-cluster'
INFO[0012] Deleted k3d-dev-cluster-serverlb
INFO[0013] Deleted k3d-dev-cluster-server-0
INFO[0013] Deleting cluster network 'k3d-dev-cluster'
INFO[0013] Deleting image volume 'k3d-dev-cluster-images'
INFO[0013] Removing cluster details from default kubeconfig...
INFO[0013] Removing standalone kubeconfig file (if there is one)...
INFO[0013] Successfully deleted cluster dev-cluster!
```

Now, continue with helm chart development. See resources on this in [helm README](./helm/README.md).
