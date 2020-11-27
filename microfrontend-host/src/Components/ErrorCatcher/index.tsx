import React, { ErrorInfo as EI, ReactNode } from "react";
import { Link } from "react-router-dom";

type ComponentDidCatchParams = Parameters<NonNullable<React.PureComponent["componentDidCatch"]>>;
type ErrorInfo = Partial<{ error: ComponentDidCatchParams[0]; info: ComponentDidCatchParams[1] }>;
type State = { errorInfo?: ErrorInfo };
type Props = { children: ReactNode };

class ErrorCatcher extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }
  componentDidCatch(error: Error, info: EI) {
    console.log(`error: ${error}, info: ${info}`);
    this.setState({
      errorInfo: {
        error,
        info,
      },
    });
  }

  render() {
    if (this.state.errorInfo) {
      return (
        <div>
          <p>Error: {this.state.errorInfo}</p>
            <Link to={"/"}>Return to start page
            </Link>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorCatcher;
