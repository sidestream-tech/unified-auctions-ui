# This command:
# - creates a cluster `nginx-cluster`
# - stops `k3d` from deploying the default traefik ingress controller
# - starts `k3d` with the `nginx` ingress instead
# - maps port 80 of the clusters ingress to port 8080 of the local host (via the loadbalancer)
# - maps port 443 of the clusters ingress to port 8443 of the local host (via the loadbalancer)
# - exposes the kubernetes API at port 6443
# - maps port range that can be used for `NodePort`s to the local host
# - uses a very specific kubernetes version for the cluster creation
#
#
# see https://en.sokube.ch/post/k3s-k3d-k8s-a-new-perfect-match-for-dev-and-test-1
# for more on this
k3d cluster create dev-cluster \
	--k3s-server-arg '--no-deploy=traefik' \
	--volume "$(pwd)/dev-cluster/helm-ingress-controller-ingress-nginx.yaml:/var/lib/rancher/k3s/server/manifests/helm-ingress-controller-ingress-nginx.yaml" \
	--port 8080:80@loadbalancer \
	--port 8443:443@loadbalancer \
	--api-port 6443 \
	-p "32000-32767:32000-32767@loadbalancer" \
	--image rancher/k3s:v1.18.20-k3s1
