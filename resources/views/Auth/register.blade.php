{{-- <div>
    @if (session()->has("success"))
        <div>
            {{ session()->get("success") }}
        </div>
    @endif
    @if (session()->has("error"))
        <div>
            {{ session()->get("error") }}
        </div>
    @endif

    <h2>Register</h2>

    <form action="{{route("register.post")}}" method="POST">
    @csrf
    <div>
    <input type="text" name="fullname" id="name" placeholder="Full Name" required autofocus>
    
    @if ($errors->has('fullname'))
    
        <span>{{$errors->first('fullname')}}</span>
    
    @endif
    </div>
    <div>
    
        <input type="email" name="email" id="email" placeholder="Email" required >
        
        @if ($errors->has('email'))
        
            <span>{{$errors->first('email')}}</span>
                                    
        @endif
    </div> 
    <div>
        <input type="password" placeholder="Password" id="password" class="form-control" name="password" required>
        
        @if ($errors->has('password'))
        
        <span>{{$errors->first('password')}}</span>
                                    
        @endif
    </div>
    <div>
            <button>sign up</button>
            <p>Already have an account?
            <a href="login">Singin</a></p>
    </div>
</form>
    </div>
 --}}

    {{-- Divyanshu--}}
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <link rel="stylesheet" href="{{ asset('css/register.css') }}">
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
        @if ($errors->any())
            <div class="alert alert-error">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif
        {{-- @if (session()->has("error"))
            <div class="alert alert-error">
                {{ session()->get("error") }}
            </div>
        @endif --}}

   <div class="main">
    <div class="conatiner">
        <h2>Register</h2>
        
            <form action="{{route("register.post")}}" method="POST">
            @csrf
        <div class="input-group">

        <input type="text" name="fullname" id="name" required autofocus>
        <label for=""><h3>Name</h3></label>

        @if ($errors->has('fullname'))
        
            <span>{{$errors->first('fullname')}}</span>
        
        @endif
        </div>
        <div class="input-group">
            
            <input type="email" name="email" id="email" required >
            <label for=""><h3>Email</h3></label>
            

            
            @if ($errors->has('email'))
            
                <span>{{$errors->first('email')}}</span>
                                        
            @endif
        </div> 
        <div class="input-group">
            <input type="password" id="password" class="form-control" name="password" required>
            <label for="">Password</label>

            @if ($errors->has('password'))
            
            <span>{{$errors->first('password')}}</span>
                                        
            @endif
        </div>
        <div>
                <button>sign up</button>
                <p>Already have an account?
                <a href="login">Singin</a></p>
        </div>
        </form>
    </div>
        
    </div>
   </div>
    
    
</body>
</html>