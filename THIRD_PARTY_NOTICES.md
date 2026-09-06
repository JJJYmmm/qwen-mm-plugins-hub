# Third-party notices

## Hugging Face doc-builder

Copyright 2018– The Hugging Face team. All rights reserved.

Documentation typography and neutral theme conventions are adapted from [doc-builder's Tailwind theme](https://github.com/huggingface/doc-builder/blob/main/kit/tailwind.config.cjs) and [app styles](https://github.com/huggingface/doc-builder/blob/main/kit/src/app.css), under the Apache License 2.0. These conventions are adapted for React and Tailwind 4 rather than using the Svelte documentation application. Source Sans 3 is used in place of Source Sans Pro. The full license is in `licenses/huggingface-doc-builder.txt`.

The three-column documentation shell also references [doc-builder's development layout](https://github.com/huggingface/doc-builder/blob/main/kit/src/routes/+layout.svelte), adapted to the site's existing React sidebar, tabs, static navigation, and plugin content.

## Qwen-MM-Plugins

Plugin descriptions, Skill Markdown and tool definitions are generated from [QwenLM/Qwen-MM-Plugins](https://github.com/QwenLM/Qwen-MM-Plugins), licensed under Apache 2.0. Each displayed source link records the exact source commit. Third-party integrations retain the notices in their upstream capability directories.

## Qwen3.5 tokenizer

Build-time token estimates use the official [Qwen/Qwen3.5-9B tokenizer](https://huggingface.co/Qwen/Qwen3.5-9B/blob/c202236235762e1c871ad0ccb60c8ee5ba337b9a/tokenizer.json) with the [Hugging Face Tokenizers](https://github.com/huggingface/tokenizers) library. Exact source and engine versions are recorded in `tokenizer.config.json`. The tokenizer asset remains in an ignored build cache and is not redistributed in the website's static assets. Refer to the upstream repositories for their licenses and notices.

## Fonts and UI libraries

Source Sans 3 and IBM Plex Mono are provided through Google Fonts under the SIL Open Font License. Font assets are bundled at build time. Lucide icons use the ISC license; React, Base UI, and shadcn components retain their package licenses. This project does not use Hugging Face logos or imply affiliation.
