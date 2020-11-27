/*


Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package controllers

import (
	"cloud.google.com/go/storage"
	"context"
	"encoding/json"
	"errors"
	"io"
	"os"
	"strings"
	"time"

	"github.com/go-logr/logr"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"

	frontendv1 "microfrontends/api/v1"
)

// MicrofrontendReconciler reconciles a Microfrontend object
type MicrofrontendReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=frontend.example.com,resources=microfrontends,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=frontend.example.com,resources=microfrontends/status,verbs=get;update;patch

func (r *MicrofrontendReconciler) Reconcile(req ctrl.Request) (ctrl.Result, error) {
	_ = context.Background()
	reqLogger := r.Log.WithValues("microfrontend", req.NamespacedName)

	reqLogger.Info("Reconciling Microfrontend")
	crds := &frontendv1.MicrofrontendList{}
	err := r.Client.List(context.TODO(), crds)
	if err != nil {
		return ctrl.Result{}, err
	}
	manifest, err := constructManifest(*crds)
	if err != nil {
		reqLogger.Error(err, "Failed to generate manifest")
		return ctrl.Result{}, err
	}
	ctx := context.Background()
	ctx, cancel := context.WithTimeout(ctx, time.Second*50)
	defer cancel()

	gcs, err := storage.NewClient(ctx)
	if err != nil {
		reqLogger.Error(err, "Failed to create gcs client")
		return ctrl.Result{}, err
	}

	wc := gcs.Bucket(os.Getenv("BUCKET")).Object("manifest.json").NewWriter(ctx)
	wc.CacheControl = "public, max-age=5"

	_, err = io.Copy(wc, strings.NewReader(manifest))
	if err != nil {
		reqLogger.Error(err, "failed to write manifest")
		return ctrl.Result{}, err
	}
	err = wc.Close()
	if err != nil {
		reqLogger.Error(err, "failed to close gcs writer")
		return ctrl.Result{}, err
	}
	return ctrl.Result{}, nil
}

func (r *MicrofrontendReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&frontendv1.Microfrontend{}).
		Complete(r)
}

type ComponentTree struct {
	Children []*ComponentTree  `json:"children,omitempty"`
	URL      string            `json:"url"`
	AppName  string            `json:"app_name"`
	Loader   string            `json:"loader"`
	Config   map[string]string `json:"config"`
}

func constructTree(list frontendv1.MicrofrontendList) (ComponentTree, error) {
	root := ComponentTree{
		Children: make([]*ComponentTree, 0, len(list.Items)),
		AppName:  "",
		Loader:   "",
	}
	trees := make(map[string]*ComponentTree, len(list.Items))
	for _, mf := range list.Items {
		trees[mf.Spec.AppName] = &ComponentTree{
			Children: nil,
			AppName:  mf.Spec.AppName,
			Loader:   mf.Spec.Loader,
			Config:   mf.Spec.Config,
			URL:      mf.Spec.URL,
		}
	}
	for _, mf := range list.Items {
		tree, _ := trees[mf.Spec.AppName]
		if mf.Spec.Parent != "" {
			parent, ok := trees[mf.Spec.Parent]
			if !ok {
				return ComponentTree{
					Children: nil,
					AppName:  "",
					Loader:   "",
				}, errors.New("schema is not valid")
			}
			parent.Children = append(parent.Children, tree)
		} else {
			root.Children = append(root.Children, tree)
		}
	}
	return root, nil
}

func constructManifest(list frontendv1.MicrofrontendList) (string, error) {
	tree, err := constructTree(list)
	if err != nil {
		return "", err
	}
	manifest, err := json.Marshal(tree)
	return string(manifest), err
}
