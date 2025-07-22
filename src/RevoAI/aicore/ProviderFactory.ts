import BaseProvider from "./BaseProvider";
import OpenAIProvider from "./OpenAIProvider";

export default class ProviderFactory {
  static create(): BaseProvider {
    return new OpenAIProvider({
      id: "openai",
      name: "openai",
      apiHost: window.localStorage.getItem("baseUrl") || "",
      apiKey: window.localStorage.getItem("apiKey") || "",
    });
  }
}
