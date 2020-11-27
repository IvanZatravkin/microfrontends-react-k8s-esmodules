# Microfrontends infrastructure boilerplate

To run this you will need your own k8s cluster. 
Consult your cloud provider on how to set up one. 


## Microfrontend-controller
Microfrontend controller uses Operator SDK v 1.1.0

If you are not using google cloud storage you may need to update operator to properly upload updated `manifest.json`.

deployment expects several environmernt variables and secrets, you must configure them in `config/manager/manager.yaml`

https://sdk.operatorframework.io/docs/building-operators/golang/tutorial/

TL/DR

`make install` to install CRD in current cluster

`make docker-build IMG=IMG_NAME` build docker image with name IMG_NAME

`make docker-push IMG=IMG_NAME` push image from previous step to your registry

`make deploy IMG=IMG_NAME` deploy your operator to kubernetes using image IMG_NAME
 
 ## Microfrontend host
 
 Build image using `docker build -t IMG_NAME`
 
 Push image to your registry
 
 Update k8s/deployment to use your image
 
 `kubectl apply -f ./k8s` to deploy it.
 
 
 You may need to update ingress.yaml if you are not using nginx-ingress-controller
 
 ## Frontends
 
 There are 3 sample frontends.
 
 To build them: `yarn && yarn build`
 
 Upload resulting files to your static storage. 
 
 Paste public url in microfrontend.yaml and run `kubectl apply -f microfrontend.yaml`