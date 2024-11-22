import { createApp } from "vue";
import {
  renderWithQiankun,
  qiankunWindow,
  QiankunProps,
} from "vite-plugin-qiankun/dist/helper";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);

let root:any = null;

function render(props: QiankunProps) {
  const { container } = props;
  const node = container
    ? container.querySelector("#app")
    : document.getElementById("app");
  console.log("🚀 ~ render ~ node:", node);
  root=app.mount(node)
  return root;
}

renderWithQiankun({
  mount(props: any) {
    root = render(props);
  },
  bootstrap() {},
  unmount(props: any) {
    console.log(props);
    root?.unmount();
  },
  update(props: any) {
    console.log(props);
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  root = render({});
}
