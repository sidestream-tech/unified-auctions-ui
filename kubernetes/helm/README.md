# Auction-UI Helm Chart

This is the helm chart of auction-ui.
The cluster runs on K8S version 1.18.6.

## Usage

To deploy this chart, run:
```sh
# 0. Set the namespace for subsequent commands
> export K8S_NAMESPACE=<your-namespace-here>
> kubectl create namespace $K8S_NAMESPACE

# 2. Install `auction-ui` in the current context

# Create the image pull secret the cluster can use to get the images
> kubectl create secret \
    docker-registry \
    sidestream-github \
    --namespace $K8S_NAMESPACE \
    --docker-server=ghcr.io \
    --docker-username=$DOCKER_USERNAME \
    --docker-password=$DOCKER_PASSWORD

# THIS IS WHERE THE CD PIPELINE STARTS
# Package the chart
> helm package .

# Install `auction-ui`
> helm install  --debug\
    --namespace $K8S_NAMESPACE \
    auction-ui \
    auction-ui-0.1.0.tgz
```
