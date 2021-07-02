<!DOCTYPE html>
<html lang="{{ GROCY_LOCALE }}"
	dir="{{ $dir }}">

<head>
	<meta charset="utf-8">
	<meta http-equiv="x-ua-compatible" content="ie=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

	<meta name="robots"	content="noindex,nofollow">
	<meta name="format-detection" content="telephone=no">

	<link rel="apple-touch-icon" sizes="180x180" href="{{ $U('/img/appicons/apple-touch-icon.png?v=', true) }}{{ $version }}">
	<link rel="icon" type="image/png" sizes="32x32"	href="{{ $U('/img/appicons/favicon-32x32.png?v=', true) }}{{ $version }}">
	<link rel="icon" type="image/png" sizes="16x16"	href="{{ $U('/img/appicons/favicon-16x16.png?v=', true) }}{{ $version }}">

	<link rel="manifest" href="{{ $U('/img/appicons/site.webmanifest?v=', true) }}{{ $version }}">
	<link rel="mask-icon" href="{{ $U('/img/appicons/safari-pinned-tab.svg?v=', true) }}{{ $version }}"	color="#0b024c">
	<link rel="shortcut icon" href="{{ $U('/img/appicons/favicon.ico?v=', true) }}{{ $version }}">
	<meta name="apple-mobile-web-app-title"	content="grocy">
	<meta name="application-name" content="grocy">
	<meta name="msapplication-TileColor" content="#e5e5e5">
	<meta name="msapplication-config" content="{{ $U('/img/appicons/browserconfig.xml?v=', true) }}{{ $version }}">
	<meta name="theme-color" content="#ffffff">

	<title>grocy</title>

	<link href="{{ $U('/components_unmanaged/noto-sans-v11-latin/noto-sans-v11-latin.min.css?v=', true) }}{{ $version }}" rel="stylesheet">
	<link href="{{ $U('/dist/grocy.css?v=', true) }}{{ $version }}"	rel="stylesheet">
</head>

<body>
	<div id="app"></div>

	<script src="{{ $U('/dist/main.js?v=', true) }}{{ $version }}"></script>
</body>

</html>
