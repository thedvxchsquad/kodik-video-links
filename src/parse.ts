import axios from "axios";
import { Errors, makeError, makeResponse } from "./utils";

export const linkPlayerRegex = /^(?<protocol>http[s]?:|)\/\/(?<host>[a-z0-9]+\.[a-z]+)\/(?<type>serial|video)\/(?<id>\d+)\/(?<hash>[0-9a-z]+)\/(?<quality>\d+p)$/;
export async function parse(link: string, extended: boolean = false) {
  if(!linkPlayerRegex.test(link)) return makeError(400, "link is not supported");
  const data: Record<string, string> = {};
  const params = linkPlayerRegex.exec(link)!;
  if(!params.groups) return Errors.internal;
  Object.assign(data, params.groups);
  if(extended) {
    try {
      const page = await axios.get<string>(`${params.groups.protocol.length === 0 ? "https:" : ""}${link}`);
      const pageMatch = page.data.match(/iframe\.src\s*=\s*"(?<url>[^"]+)";/);
      if(!pageMatch?.groups?.url) throw "ывзаыхвахывха че за";
      const extFields = new URL("https:" + pageMatch.groups.url);
      const obj = Array.from(extFields.searchParams).reduce((p, [k,v]) => (p[k]=v, p), {} as Record<string, string>);
      return makeResponse(200, {...data, ...obj});
    } catch (error) {
      return makeError(500, "Cannot get extended fields. Try later");
    };
  };
  return makeResponse(200, data);
};