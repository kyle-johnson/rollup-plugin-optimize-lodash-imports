import { isNil } from "lodash";

export const Hello = ({ name }) => {
  return <div>{isNil(name) ? "unknown" : name}</div>;
}
