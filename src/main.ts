import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import {
  renderWithQiankun,
  qiankunWindow,
  QiankunProps,
} from "vite-plugin-qiankun/dist/helper";
import "./reset.css";
import "./style.css";
import App from "./App.vue";

const pinia = createPinia();

const app = createApp(App);

app.use(pinia);

app.use(ElementPlus);

let root: any = null;

function render(props: QiankunProps) {
  const { container } = props;
  const node = container
    ? container.querySelector("#app")
    : document.getElementById("app");
  console.log("🚀 ~ render ~ node:", node);
  root = app.mount(node);
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
