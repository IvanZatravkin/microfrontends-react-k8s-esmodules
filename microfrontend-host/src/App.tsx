import React from "react";
import { BrowserRouter } from "react-router-dom";

import Controller from "./Components/Controller";
import ErrorCatcher from "./Components/ErrorCatcher";

const App = ({}) => {
  return (
    <BrowserRouter>
        <ErrorCatcher>
          <Controller />
        </ErrorCatcher>
    </BrowserRouter>
  );
};

export default App;
