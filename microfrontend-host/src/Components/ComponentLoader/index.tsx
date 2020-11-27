import React, { useState, useEffect } from "react";

interface IComponentLoader {
  url: string;
  props: any;
}

const Loading: React.ComponentType<any> = () => null;

const ComponentLoader = ({ url, props }: IComponentLoader) => {
  const [Component, setComponent] = useState<React.ComponentType<any>>(Loading);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    import(url)
      .then((module) => {
        const Component = module.default;
        setComponent(Component);
      })
      .catch(setError);
  }, []);

  if (error) {
    return (
      <div>
          <p>
            Sorry! Something went wrong...
          </p>
          <p>
            Microfrontend failed to load.
          </p>
      </div>
    );
  }

  return <Component {...props}/>;
};

export default ComponentLoader;
