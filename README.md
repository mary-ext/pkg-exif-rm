# exif-rm

Remove EXIF information from PNG, JPEG and WebP images.

```ts
const image = await Deno.readFile('./samples/sample.jpg');
const exifRemoved = remove(image);
```

For PNG specifically, also removes `tIME` `iTXt` `tEXt` `zTXT` and `dSIG` fields.
