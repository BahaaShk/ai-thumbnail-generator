import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import axios, { AxiosResponse } from "axios";
import imagekit from "../config/imagekit.js";

/* -------------------------
   Prompt configuration
   ------------------------- */
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
} as const;

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
} as const;

/* -------------------------
   Helper: call Hugging Face Router
   - Uses router.huggingface.co (replacement for api-inference)
   - validateStatus accepts all so we can inspect error body
   ------------------------- */
async function callHuggingFaceRouter(
  modelId: string,
  prompt: string
): Promise<AxiosResponse<ArrayBuffer>> {
  const url = `https://router.huggingface.co/models/${modelId}`;
  return axios.post(
    url,
    {
      inputs: prompt,
      options: { wait_for_model: true },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "thumbnail-service/1.0",
      },
      responseType: "arraybuffer",
      timeout: 120000,
      validateStatus: () => true,
    }
  );
}

/* -------------------------
   Helper: detect JSON error in arraybuffer
   - returns parsed JSON if buffer contains JSON, otherwise null
   ------------------------- */
function tryParseBufferAsJson(buf: ArrayBuffer | Buffer | any): any | null {
  try {
    const buffer = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
    const text = buffer.toString("utf8").trim();
    if (!text) return null;
    if (text[0] === "{" || text[0] === "[") {
      return JSON.parse(text);
    }
    return null;
  } catch {
    return null;
  }
}

/* -------------------------
   Main controller
   ------------------------- */
export const generateThumbnail = async (req: Request, res: Response) => {
  let thumbnail: any = null;
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

    thumbnail = await Thumbnail.create({
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

    // Build prompt
    let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}" `;
    if (color_scheme) {
      prompt += `Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme. `;
    }
    if (user_prompt) {
      prompt += `Additional details: ${user_prompt} `;
    }
    prompt += `The thumbnail should be ${aspect_ratio}, visually stunning, and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`;

    // Models to try in order (fallbacks)
    const modelsToTry = [
      "stabilityai/stable-diffusion-3.5",
      "runwayml/stable-diffusion-v1-5",
      "stabilityai/stable-diffusion-xl-1024-v1-0",
    ];

    let lastError: any = null;
    let finalBuffer: Buffer | null = null;
    let hfResponseHeaders: any = null;

    for (const modelId of modelsToTry) {
      try {
        console.log(`Calling Hugging Face Router model: ${modelId}`);
        const hfResp = await callHuggingFaceRouter(modelId, prompt);
        hfResponseHeaders = hfResp.headers || {};

        // Try to parse JSON error even if content-type is wrong
        const parsedJson = tryParseBufferAsJson(hfResp.data);
        if (parsedJson && (parsedJson.error || parsedJson.detail || parsedJson.message)) {
          console.log(`Hugging Face Router returned JSON error for ${modelId}:`, parsedJson);
          lastError = { model: modelId, status: hfResp.status, body: parsedJson };
          if (hfResp.status >= 400 && hfResp.status < 500 && hfResp.status !== 429) {
            break;
          }
          continue;
        }

        // If content-type indicates JSON, parse and treat as error
        const contentType = (hfResp.headers["content-type"] || "").toLowerCase();
        if (contentType.includes("application/json")) {
          const parsed = tryParseBufferAsJson(hfResp.data);
          console.log(`Hugging Face Router JSON response for ${modelId}:`, parsed);
          lastError = { model: modelId, status: hfResp.status, body: parsed };
          if (hfResp.status >= 400 && hfResp.status < 500 && hfResp.status !== 429) {
            break;
          }
          continue;
        }

        // If status indicates success and data length looks like an image, accept it
        if (hfResp.status >= 200 && hfResp.status < 300 && hfResp.data) {
          const buffer = Buffer.from(hfResp.data);
          // Basic image signature checks (PNG/JPEG)
          const isPng = buffer.slice(0, 8).toString("hex").startsWith("89504e470d0a1a0a");
          const isJpeg = buffer.slice(0, 3).toString("hex") === "ffd8ff";
          if (isPng || isJpeg) {
            finalBuffer = buffer;
            console.log(`Received image from model ${modelId} (content-type: ${contentType})`);
            break;
          } else {
            // Not a standard PNG/JPEG signature — still accept but log
            console.log(`Response from ${modelId} does not match PNG/JPEG signatures. content-type: ${contentType}`);
            finalBuffer = buffer;
            break;
          }
        }

        // Otherwise record and continue
        lastError = { model: modelId, status: hfResp.status, headers: hfResp.headers };
      } catch (innerErr: any) {
        console.log(`Error calling model ${modelId}:`, innerErr?.message || innerErr);
        lastError = { model: modelId, error: innerErr?.message || innerErr };
      }
    }

    // If we didn't get an image buffer, return a clear error
    if (!finalBuffer) {
      thumbnail.isGenerating = false;
      await thumbnail.save();
      console.log("No image buffer obtained. Last error:", lastError, "HF headers:", hfResponseHeaders);
      return res.status(502).json({
        message: "Failed to generate image from Hugging Face models",
        lastError,
        hfResponseHeaders,
      });
    }

    // Upload to ImageKit
    try {
      const filename = `final-output-${Date.now()}.png`;
      const uploadResult = await imagekit.upload({
        file: finalBuffer,
        fileName: filename,
      });

      console.log("ImageKit upload result:", uploadResult);

      thumbnail.image_url = uploadResult.url;
      thumbnail.isGenerating = false;
      await thumbnail.save();

      return res.json({ message: "Thumbnail Generated", thumbnail });
    } catch (uploadErr: any) {
      console.log("ImageKit upload failed:", uploadErr);
      thumbnail.isGenerating = false;
      await thumbnail.save();
      return res.status(500).json({ message: "Image upload failed", error: uploadErr?.message || uploadErr });
    }
  } catch (error: any) {
    console.log("Unexpected error in generateThumbnail:", error);
    if (thumbnail) {
      thumbnail.isGenerating = false;
      await thumbnail.save();
    }
    if (error?.response?.data) {
      const parsed = tryParseBufferAsJson(error.response.data);
      if (parsed) {
        return res.status(error.response.status || 500).json({ message: "HF Router Error", error: parsed });
      }
    }
    return res.status(500).json({ message: error?.message || "Unknown server error" });
  }
};

/* -------------------------
   Delete controller
   ------------------------- */
export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;

    await Thumbnail.findByIdAndDelete({ _id: id, userId });

    res.json({ message: "Thumbnail Deleted Successfully" });
  } catch (error: any) {
    console.log("deleteThumbnail error:", error);
    res.status(500).json({ message: error.message });
  }
};