import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("main", "routes/main/main.tsx"),
] satisfies RouteConfig;
