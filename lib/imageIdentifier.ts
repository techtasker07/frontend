import * as tmImage from "@teachablemachine/image";

let model: tmImage.CustomMobileNet | null = null;

export async function loadModel() {
  if (!model) {
    const url = "https://teachablemachine.withgoogle.com/models/3K8dUYMCT/";
    model = await tmImage.load(url + "model.json", url + "metadata.json");
  }
  return model;
}

export async function classifyImage(image: HTMLImageElement) {
  const m = await loadModel();
  const predictions = await m.predict(image);
  // Sort by probability, highest first
  return predictions.sort((a, b) => b.probability - a.probability);
}
