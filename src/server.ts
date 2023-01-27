import { App } from '@tinyhttp/app';
import { printParser, printServer, printVideoLinks } from './logger';
import { VideoLinks } from 'kodikwrapper';
import { createErrorAnswer } from './helpers';
import { BadRequestError, NotFoundError } from './errors';

const app = new App();
const PORT = +(process.env.PORT ?? 3000);

app.get('/parse', async (req, res) => {
  const { link, extended } = req.query;
  if (!link) return res.status(400).json(createErrorAnswer(new BadRequestError('"link" not passed')));
  const isExtended = extended === '' || extended === 'true';
  printParser(`parse ${link} ${isExtended ? '(extended)' : ''}`);
  try {
    const result = await VideoLinks.parseLink({
      link: link.toString(),
      extended: isExtended
    });
    res.status(200).json({
      ok: true,
      data: result
    });
  } catch (error) {
    res.status(400).json(createErrorAnswer(error));
  };
});
app.get('/video-links', async (req, res) => {
  const { link, extended } = req.query;
  if (!link) return res.status(400).json(createErrorAnswer(new BadRequestError('"link" not passed')));
  const isExtended = extended === '' || extended === 'true';
  printVideoLinks(`videolinks ${link} ${isExtended ? '(extended)' : ''}`);
  try {
    const result = await VideoLinks.getLinks({
      link: link.toString(),
      extended: isExtended
    });
    res.status(200).json({
      ok: true,
      data: result
    });
  } catch (error) {
    res.status(400).json(createErrorAnswer(error));
  };
});

app.use(async (req, res) => {
  res.status(400).json(createErrorAnswer(new NotFoundError('unkonwn API method')));
});

app.listen(PORT, () => {
  printServer(`started at port ${PORT}`);
});