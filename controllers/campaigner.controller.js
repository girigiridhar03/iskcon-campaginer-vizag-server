import {
  createCampaignerService,
  deleteCampaignerService,
  getCampaignerService,
  getLastestDonorofCampaignerService,
  getSingleCampaignerService,
  getTopDonorsService,
  updateCampaignerService,
} from "../services/campaigner.service.js";
import { asyncHandlers } from "../utils/handlers.js";
import { response } from "../utils/response.js";

const FRONTEND_BASE_URL = "https://campaigns.harekrishnavizag.org";
const SHARE_BASE_URL =
  "https://campaign-server-882278565284.asia-south1.run.app/share";

export const createCampaigner = asyncHandlers(async (req, res) => {
  const { status, message, newCampaigner } = await createCampaignerService(req);

  response(res, status, message, newCampaigner);
});

export const getCampaigners = asyncHandlers(async (req, res) => {
  const { status, message, campaigners, count, totalPages } =
    await getCampaignerService(req);

  response(res, status, message, { campaigners, count, totalPages });
});

export const getSingleCampaigner = asyncHandlers(async (req, res) => {
  const { status, message, campaginerWithImage, count } =
    await getSingleCampaignerService(req);

  response(res, status, message, { campaginers: campaginerWithImage, count });
});

export const getCampaignerSharePage = asyncHandlers(async (req, res) => {
  const { campaginerWithImage } = await getSingleCampaignerService(req);

  const slug = campaginerWithImage?.slug;
  const campaignName =
    campaginerWithImage?.campaignId?.name || "ISKCON Gambiram";
  const raisedAmount = Number(campaginerWithImage?.raisedAmount || 0);
  const targetAmount = Number(campaginerWithImage?.targetAmount || 0);

  const pageUrl = `${FRONTEND_BASE_URL}/${slug}`;
  const shareUrl = `${SHARE_BASE_URL}/${slug}`;
  const imageUrl =
    campaginerWithImage?.image?.url || `${FRONTEND_BASE_URL}/hkm_logo.svg`;

  const title = `${campaignName} | ${campaginerWithImage?.name}`;
  const description = `Join ${campaginerWithImage?.name} in supporting the construction of Sri Srinivasa Govinda Temple. Raised: ₹${raisedAmount.toLocaleString("en-IN")} | Goal: ₹${targetAmount.toLocaleString("en-IN")}. Donate today!`;

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(shareUrl)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:site_name" content="ISKCON Gambiram" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <meta http-equiv="refresh" content="0;url=${escapeHtml(pageUrl)}" />
    <script>
      window.location.replace(${JSON.stringify(pageUrl)});
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="${escapeHtml(pageUrl)}">${escapeHtml(pageUrl)}</a>...</p>
  </body>
</html>`);
});

export const getTopDonors = asyncHandlers(async (req, res) => {
  const { status, message, topDonors } = await getTopDonorsService(req);

  response(res, status, message, topDonors);
});

export const getLastestDonorofCampaigner = asyncHandlers(async (req, res) => {
  const { status, message, donations } =
    await getLastestDonorofCampaignerService(req);

  response(res, status, message, donations);
});

export const updateCampaigner = asyncHandlers(async (req, res) => {
  const { status, message, data } = await updateCampaignerService(req);

  response(res, status, message, data);
});

export const deleteCampaigner = asyncHandlers(async (req, res) => {
  const { status, message, data } = await deleteCampaignerService(req);
  response(res, status, message, data);
});
