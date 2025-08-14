# exif-rm

[JSR](https://jsr.io/@mary/exif-rm) | [source code](https://tangled.sh/@mary.my.id/pkg-exif-rm)

remove EXIF information from PNG, JPEG and WebP images.

```ts
const image = await Deno.readFile('./samples/sample.jpg');
const exifRemoved = remove(image);
```

For PNG specifically, also removes `tIME` `iTXt` `tEXt` `zTXT` and `dSIG` fields.
