<?php

class URIScriptValidator implements IURIScriptValidator
{
    public static function validate($requestURI, $redirectURL): void
    {
        $segments = explode('/', $requestURI);

        $possibleScripts = self::ValidatePossibleScripts(($requestURI));

        if (isset($segments[2]) || $possibleScripts) {
            header("Location: " . $redirectURL);
            exit;
        }
    }

    private static function validatePossibleScripts(string $requestURI): bool
    {
        $decodedURI = urldecode($requestURI);

        return preg_match('/%22|"/', $requestURI) ||
            preg_match('/%27|\'/', $requestURI) ||
            preg_match('/%3Cscript%3E|<script>/', $decodedURI) ||
            preg_match('/%3C.*%3E|<.*>/', $decodedURI) ||
            preg_match('/on[a-z]+=[^&]*/i', $decodedURI);
    }
}
