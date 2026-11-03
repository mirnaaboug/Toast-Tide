import re, sys
src = open(sys.argv[1], encoding='utf-8').read()
helmet = re.search(r'<helmet>(.*?)</helmet>', src, re.S).group(1)
xdc = re.search(r'<x-dc>(.*?)</x-dc>', src, re.S).group(1)
body_tpl = re.sub(r'<helmet>.*?</helmet>', '', xdc, flags=re.S)
body_tpl = re.sub(r'<!--.*?-->', '', body_tpl, flags=re.S)
logic = re.search(r'<script type="text/x-dc"[^>]*>(.*?)</script>', src, re.S).group(1)
runtime = open('tools/runtime.js', encoding='utf-8').read()
out = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>toast&amp;tide · order online</title>
<meta name="description" content="Toast &amp; Tide, Soma Bay: build-your-own toast, a gluten-free bakery and a Greek yogurt bar. Order ahead.">
{helmet}
</head>
<body>
<div id="app"></div>
<template id="tt-template">{body_tpl}</template>
<script>
{runtime}
</script>
<script>
{logic}
ttMount(Component);
</script>
</body>
</html>
'''
open('index.html', 'w', encoding='utf-8').write(out)
print('ok', len(out))
