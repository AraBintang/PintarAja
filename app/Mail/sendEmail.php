<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SendEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $resetLink;
    public $userName;

    public function __construct($resetLink, $userName)
    {
        $this->resetLink = $resetLink;
        $this->userName = $userName;
    }  

    public function build()
    {
        return $this->subject('Buat Password Baru')
                    ->view('sendEmail')
                    ->with([
                        'resetLink' => $this->resetLink,
                        'userName' => $this->userName,
                    ]);
    }
}
