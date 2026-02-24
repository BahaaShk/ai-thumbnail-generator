import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import imagekit from "../config/imagekit.js";
import { InferenceClient } from "@huggingface/inference";

const stylePrompts = {
  "Bold & Graphic":
    "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style",
  "Tech/Futuristic":
    "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",
  Minimalist:
    "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",
  Photorealistic:
    "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field",
  Illustrated:
    "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",
};

const colorSchemeDescriptions = {
  vibrant:
    "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
  sunset:
    "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",
  forest:
    "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
  neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
  purple:
    "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
  monochrome:
    "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",
  ocean:
    "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
  pastel:
    "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",
};

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;
    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    // Build prompt — include aspect ratio as a hint to the model
    let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}" `;

    if (color_scheme) {
      prompt += `Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme. `;
    }

    if (user_prompt) {
      prompt += `Additional details: ${user_prompt} `;
    }

    // Pass aspect ratio as a prompt hint since free tier ignores target_size
    prompt += `Compose the image for a ${aspect_ratio} aspect ratio. Make it visually stunning and designed to maximize click-through rate. Bold, professional, and impossible to ignore.`;

    // Initialize HF Inference Client
    const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY!);

    const imageBlob = await client.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
      parameters: {
        num_inference_steps: 4,
      },
    });

    // Handle both Blob and string return types
    let finalBuffer: Buffer;

    if (typeof imageBlob === "string") {
      finalBuffer = Buffer.from(imageBlob, "base64");
    } else {
      const arrayBuffer = await (imageBlob as Blob).arrayBuffer();
      finalBuffer = Buffer.from(arrayBuffer);
    }

    // Upload to ImageKit
    const filename = `thumbnail-${Date.now()}.png`;
    const uploadResult = await imagekit.upload({
      file: finalBuffer,
      fileName: filename,
    });

    console.log("ImageKit upload result:", uploadResult);

    thumbnail.image_url = uploadResult.url;
    thumbnail.prompt_used = prompt;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    return res.json({ message: "Thumbnail Generated", thumbnail });
  } catch (error: any) {
    console.log("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;

    await Thumbnail.findByIdAndDelete({ _id: id, userId });

    res.json({ message: "Thumbnail Deleted Successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};