<?php

class ParamsValidator
{
    
    /**
     * Validates the parameters in the request URI based on predefined rules.
     *
     * @param array  $params      An associative array where the key is the parameter name and the value is the validation rule(s).
     * @param string $requestURI  The full URI of the request.
     * @param string $redirectURL The URL to redirect to if validation fails.
     * @param bool   $optional    A flag indicating if the validation is optional. If set to `true`, the absence of parameters won't cause a redirection.
     * 
     * @return void
     */
    public static function validate(array $params, string $requestURI, string $redirectURL, bool $optional): void
    {
        $segments = explode('?', $requestURI);

        // If there are no params and the validation is optional, return without doing anything
        if (empty($segments[1])) {
            if (!$optional) {
                header("Location: " . $redirectURL);
                exit;
            }
            return;
        }

        $valid = true;

        foreach ($params as $key => $validationType) {

            // If is an array of validations
            if (is_array($validationType)) {
                $allFailed = true;
                $allMatchValid = true;
                foreach ($validationType as $validation) {

                    // If the validation is an array so its a mecth validation
                    if (is_array($validation)) {
                        foreach ($validation as $index => $expectedValue) {
                            if (self::runValidation($key, ParamsValidatorKeys::MATCH, $expectedValue, $requestURI)) {
                                $allMatchValid = false;
                                break;
                            }
                        }
                    } else {
                        if (self::runValidation($key, $validation, null, $requestURI)) {
                            $allFailed = false;
                            break;
                        }
                    }
                }

                if ($allFailed && $allMatchValid) {
                    $valid = false;
                }
            } else {
                if (!self::runValidation($key, $validationType, null, $requestURI)) {
                    $valid = false;
                }
            }
        }

        if (!$valid) {
            header("Location: " . $redirectURL);
            exit;
        }
    }


    /**
     * Executes a specific validation based on the validation type.
     *
     * @param string $value          The parameter value to validate.
     * @param string $validationType The type of validation to run.
     * @param mixed  $expectedValue  The expected value for match validation (optional).
     * @param string $requestURI     The full URI of the request.
     * 
     * @return bool Returns `true` if validation passes, otherwise `false`.
     */
    private static function runValidation(string $value, string $validationType, $expectedValue, string $requestURI): bool
    {
        switch ($validationType) {
            case ParamsValidatorKeys::NUMERICAL:
                return ParamsValidatorMethods::numericalValidator($value, $requestURI);

            case ParamsValidatorKeys::DATE:
                return ParamsValidatorMethods::dateValidator($value, $requestURI);

            case ParamsValidatorKeys::SIMPLE_DATE:
                return ParamsValidatorMethods::simpleDateValidatorList($value, $requestURI);

            case ParamsValidatorKeys::SIMPLE_DATETIME:
                return ParamsValidatorMethods::simpleDateTimeValidator($value, $requestURI);

            case ParamsValidatorKeys::COMPLEX_DATETIME:
                return ParamsValidatorMethods::complexDateTimedateValidator($value, $requestURI);

            case ParamsValidatorKeys::EXISTS:
                return ParamsValidatorMethods::existsInURLValidator($value, $requestURI);

            case ParamsValidatorKeys::REDIRECT_GUEST_RESERVATION:
                return ParamsValidatorMethods::redirectGuestReservationValidator($requestURI);

            case ParamsValidatorKeys::BOOLEAN:
                return ParamsValidatorMethods::booleanValidator($value, $requestURI);

            case ParamsValidatorKeys::MATCH:
                return ParamsValidatorMethods::matchValidator($value, $expectedValue, $requestURI);

            default:
                return false;
        }
    }
}
