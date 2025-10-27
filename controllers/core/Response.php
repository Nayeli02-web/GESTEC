<?php

class Response
{
    private $status = 200;

    public function status(int $code)
    {
        $this->status = $code;
        return $this;
    }
    
    public function toJSON($response = [],$message="")
    {
        header('Content-Type: application/json');
        
        if (isset($response) && ($response !== null && $response !== false)) {
            $json = $response;
        } else {
            if (!empty($message)) {
                $json = ['status' => $this->status, 'result' => $message];
            } else {
                $this->status = 400;
                $json = ['status' => $this->status, 'result' => 'No se efectuó la solicitud'];
            }
        }

        http_response_code($this->status);
        echo json_encode($json);
    }
}
