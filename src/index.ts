import { createServer, IncomingMessage, ServerResponse } from "http";
import url from "url";
import qs from "querystring";
import axios from "axios";

const port = process.env.PORT || 3000;

const islink =
  /^(?:https?:)?\/\/(?:[a-z\.]+)\/([a-zA-Z]+)\/(\d+)\/([a-zA-Z0-9]+)\/(\d+)p$/;

const ArrayAsObject = (example: { [x: string | symbol | number]: number }) => {
  return function (enterArray: any[]) {
    const obj = {};
    for (const [key, value] of Object.entries(example)) {
      obj[key] = enterArray[value];
    }
    return obj;
  };
};

const routes = {
  async "/parse"(
    req: IncomingMessage,
    res: ServerResponse,
    parsed: URL,
    query: qs.ParsedUrlQuery
  ) {
    if (typeof query.link !== "string") {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          ok: false,
          error: "query.link not a string",
        })
      );
    }
    const link = query.link as string;
    if (!islink.test(link)) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          ok: false,
          error: "query.link is not allowed",
        })
      );
    }

    const [, type, id, hash, quality] = islink.exec(link);

    const params = {
      type,
      id,
      hash,
      quality,
    };

    if ("extended" in query) {
      const page = await axios.get(
        `${!link.startsWith("http") ? "https:" : ""}${link}`
      );

      const matched = page.data.match(
        /iframe\.src = "\/\/(?:[a-z\.]+)\/go\/([a-zA-Z]+)\/(\d+)\/([a-zA-Z0-9]+)\/(\d+)p\?d=([a-zA-Z0-9\.]+)&d_sign=([a-z0-9]+)&pd=([a-zA-Z0-9\.]+)&pd_sign=([a-z0-9]+)&ref=&ref_sign=([a-z0-9]+).+";/
      );

      Object.assign(
        params,
        ArrayAsObject({
          type: 1,
          id: 2,
          hash: 3,
          quality: 4,
          d: 5,
          d_sign: 6,
          pd: 7,
          pd_sign: 8,
          ref_sign: 9,
        })(matched),
        { ref: "" }
      );
    }

    res.end(
      JSON.stringify({
        ok: true,
        parsed: params,
      })
    );
  },

  async "/video-links"(
    req: IncomingMessage,
    res: ServerResponse,
    parsed: URL,
    query: qs.ParsedUrlQuery
  ) {
    const { data: releaseParsedResponse, request } = await axios.get(`http://localhost:${port}/parse`, {
      params: {
        extended: true,
        link: query.link,
      },
      validateStatus: (_) => true,
    });

    if (!releaseParsedResponse.ok)
      return res.end(JSON.stringify(releaseParsedResponse));

      const paramstoo = {
        info: "{}",
        ban_user: false,
        ...releaseParsedResponse.parsed,
      };
      delete paramstoo.quality;

    try {
      const postresponse = await axios.post("https://aniqit.com/gvi", null, {
        params: paramstoo
      });

      for (const key of Object.keys(postresponse.data.links)) {
        postresponse.data.links[key].map(video => (video.src = Buffer.from(video.src.split("").reverse().join(""), "base64").toString("utf-8"), video))
      }

      res.end(JSON.stringify({
        ok: true,
        ...("extended" in query && {
          params: paramstoo
        }),
        links: postresponse.data.links
      }))
    } catch (error) {
      return res.end(JSON.stringify({
        ok: false,
        error: "cannot get sources from aniqit.com/gvi"
      }))
    }
  },
};

async function Server(req: IncomingMessage, res: ServerResponse) {
  const urlParsed = url.parse(req.url);
  const query = qs.decode(urlParsed.query);

  if (routes[urlParsed.pathname])
    return routes[urlParsed.pathname](req, res, urlParsed, query);

  res.end(JSON.stringify({ ok: false, error: "not found method" }));
}

const server = createServer(Server);

server.listen(port, () =>
  console.log(`> server has been started at port ${port}`)
);