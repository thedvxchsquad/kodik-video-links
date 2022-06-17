import axios from "axios";
import { parse } from "./parse";
import { makeError, makeResponse } from "./utils";

export async function videoLinks(link: string, extended: boolean = false) {
  const params = await parse(link, true);
  if("error" in params) return params;
  const requestParams = {
    info: "{}",
    ban_user: false,
    ...params.data,
  };
  try {
    const rawVideoLinksResponse = await axios.post<VideoLinksTypes>("https://aniqit.com/gvi", null, {
      params: requestParams
    });
    const videoLinks = Object.entries(rawVideoLinksResponse.data.links).reduce((response, [quality, src]) => (response.links[quality] = src.map(t => (t.src = Buffer.from(t.src.split("").reverse().join(""), "base64").toString("utf-8"), t)), response), {links: {}} as VideoLinksTypes);
    return makeResponse(200, {
      ...videoLinks,
      ...(extended ? {params: params.data} : {})
    });
  } catch(error) {
    return makeError(500, "Cannot get video-links");
  };
}