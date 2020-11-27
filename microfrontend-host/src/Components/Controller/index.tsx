import React, { useEffect, useState } from "react";
import { Link, Outlet, Route, Routes } from "react-router-dom";

import ComponentLoader from "../ComponentLoader";
import PageNotFound from "../PageNotFound";

const MANIFEST_URL = process.env.MANIFEST_URL;

type IManifest = {
  url: string;
  app_name: string;
  loader: string;
  config: { [i: string]: string | number } | null;
  children: IManifest[];
};

const renderRoutes = (children: IManifest[]) =>
  children.map(({ url, app_name, children, loader, config }: IManifest) => (
    <Route
      key={app_name}
      path={url}
      element={
        <ComponentLoader
          url={loader}
          props={{ config, childrenConfig: children }}
        />
      }
    />
  ));

const Controller = () => {
  const [manifest, setManifest] = useState<IManifest>();
  useEffect(() => {
    fetch(MANIFEST_URL!)
      .then((data) => data.json())
      .then(setManifest);
  }, []);

  if (!manifest) return null;

  return (
    <div style={{ display: "flex", flexFlow: "column" }}>
      <div
        style={{
          backgroundColor: "#eee",
          padding: "10px",
          display: "flex",
          flexGrow: 0,
          width: "100%",
        }}
      >
        {manifest.children.map((child) => {
          return (
            <Link
              style={{ padding: 8, backgroundColor: "#333", color: "#eee" }}
              to={child.url}
            >
              {child.app_name}
            </Link>
          );
        })}
      </div>
      <div style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Outlet />}>
            {renderRoutes(manifest?.children || [])}
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default Controller;
