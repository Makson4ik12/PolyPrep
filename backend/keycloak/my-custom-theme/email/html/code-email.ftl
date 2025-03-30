<#-- @ftlvariable name="username" type="java.lang.String" -->
<#-- @ftlvariable name="code" type="java.lang.String" -->
<#-- @ftlvariable name="ttl" type="java.lang.Integer" -->
<html>
<head>
    <title>Ваш код доступа</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; }
        .code { 
            font-size: 24px; 
            font-weight: bold; 
            letter-spacing: 2px; 
            padding: 10px 15px; 
            background: #f5f5f5; 
            display: inline-block; 
            margin: 15px 0;
            border: 1px dashed #ccc;
        }
        .note { color: #666; font-size: 14px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <p>Здравствуйте, ${username}!</p>
        
        <p>Ваш код для входа:</p>
        
        <div class="code">${code}</div>
        
        <p class="note">Не сообщайте этот код никому.</p>
        
        <div class="footer">
            <p>Если вы не запрашивали этот код, проигнорируйте это письмо.</p>
        </div>
    </div>
</body>
</html>