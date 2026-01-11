{{-- @if (session()->has("success"))
                
    <div >
        {{ session()->get("success") }}
    </div>
@endif
@if (session()->has("error"))
                
    <div >
        {{ session()->get("error") }}
    </div>
@endif
    
    <form action="{{route("login.post")}}" method="POST">
    
        @csrf
        <div>
            <input type="email" name="email" id="email" placeholder="Email" required autofocus>
                @if ($errors->has('email'))
                    <span>{{$errors->first('email')}}</span>
                                    
                @endif
        </div>
        <div>
            <input type="password" placeholder="Password" id="password" name="password" required>
                @if ($errors->has('password'))
                    <span>{{$errors->first('password')}}</span>
                                    
                @endif
        </div>
        <div>
            <button >Sign in</button>
                <p>
                    Don't have an account?
                    <a href="register">Register</a></p>
        </div>
    </form> --}}

    {{-- Divyanshu --}}

    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <link rel="stylesheet" href="{{ asset('css/signin.css') }}">
</head>
<body>
    <div class="head">
        <h1>TimeFlow-AD.</h1>
    </div>
        @if (session()->has("success"))
            <div class="alert alert-success">
                {{ session()->get("success") }}
            </div>
        @endif

        @if (session()->has("error"))
            <div class="alert alert-error">
                {{ session()->get("error") }}
            </div>
        @endif
   <div class="main">
    <div class="conatiner">
        <h2>Login</h2>
                 
            <form action="{{route("login.post")}}" method="POST">
            
                @csrf
                <div class="input-group">

                    <input type="email" name="email" id="email" required autofocus>
                    <label for="">Email</label>
                    
                        @if ($errors->has('email'))
                            <span>{{$errors->first('email')}}</span>
                                            
                        @endif
                </div>
                <div class="input-group">

                    <input type="password" id="password" name="password" required>
                    <label for="">Password</label>
                    
                        @if ($errors->has('password'))
                            <span>{{$errors->first('password')}}</span>
                                            
                        @endif
                </div>
                <div>
                    <button >Sign in</button>
                        <p>
                            Don't have an account?
                            <a href="register">Register</a></p>
                </div>
            </form>
    </div>
   </div>
    
    
</body>
</html>