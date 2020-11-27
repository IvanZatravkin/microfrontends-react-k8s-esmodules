package controllers

import (
	"encoding/json"
	frontendv1 "microfrontends/api/v1"
	"testing"

	"github.com/stretchr/testify/assert"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func Test_constructTree(t *testing.T) {
	assert := assert.New(t)
	type args struct {
		list frontendv1.MicrofrontendList
	}
	mfs1 := frontendv1.MicrofrontendSpec{
		URL:     "/app1",
		Loader:  "example.com/app1.json",
		AppName: "app1",
		Parent:  "",
		Config:  nil,
	}
	mfs2 := frontendv1.MicrofrontendSpec{
		URL:     "/app2",
		Loader:  "example.com/app2.json",
		AppName: "app2",
		Parent:  "",
		Config:  nil,
	}
	mfs3 := frontendv1.MicrofrontendSpec{
		URL:     "/app3",
		Loader:  "example.com/app3.json",
		AppName: "app3",
		Parent:  "app2",
		Config:  nil,
	}
	list := frontendv1.MicrofrontendList{
		Items: []frontendv1.Microfrontend{
			{
				TypeMeta:   metav1.TypeMeta{},
				ObjectMeta: metav1.ObjectMeta{},
				Spec:       mfs1,
				Status:     frontendv1.MicrofrontendStatus{},
			},
			{
				TypeMeta:   metav1.TypeMeta{},
				ObjectMeta: metav1.ObjectMeta{},
				Spec:       mfs2,
				Status:     frontendv1.MicrofrontendStatus{},
			},
			{
				TypeMeta:   metav1.TypeMeta{},
				ObjectMeta: metav1.ObjectMeta{},
				Spec:       mfs3,
				Status:     frontendv1.MicrofrontendStatus{},
			}},
	}
	res := ComponentTree{
		Children: []*ComponentTree{
			{
				Children: nil,
				AppName:  mfs1.AppName,
				Loader:   mfs1.Loader,
				URL:      mfs1.URL,
			},
			{
				Children: []*ComponentTree{
					{
						Children: nil,
						AppName:  mfs3.AppName,
						Loader:   mfs3.Loader,
						URL:      mfs3.URL,
					},
				},
				AppName: mfs2.AppName,
				Loader:  mfs2.Loader,
				URL:     mfs2.URL,
			},
		},
		AppName: "",
		Loader:  "",
	}
	tests := []struct {
		name string
		args args
		want ComponentTree
	}{
		{
			name: "Test basic functionality",
			args: args{list: list},
			want: res,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, _ := constructTree(tt.args.list)
			assert.EqualValues(tt.want, got, tt.name)
			manifest, _ := json.Marshal(tt.want)
			tested_manifest, _ := constructManifest(tt.args.list)
			assert.Exactlyf(string(manifest), tested_manifest, "manifest should match expected")
		})
	}
}
