@extends("layouts.default")
@section("title","Register")
@section("content")
    <main class="mt-5">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-4">
                @if (session()->has("success"))
                
                <div class="alert alert-success">
                    {{ session()->get("success") }}
                </div>
                @endif
                @if (session()->has("error"))
                
                <div class="alert alert-danger">
                    {{ session()->get("error") }}
                </div>
                @endif
                <div class="card">
                    <h3 class="card-header text-center">Register</h3>
                    <div class="card-body">
                        <form action="{{route("register.post")}}" method="POST">
                            @csrf
                            <div class="form-group mb-3">
                                <input type="text" name="fullname" id="name" placeholder="Full Name" class="form-control" required autofocus>
                                @if ($errors->has('fullname'))
                                    <span class="text-danger">{{$errors->first('fullname')}}</span>
                                    
                                @endif
                            </div>
                            <div class="form-group mb-3">
                                <input type="email" name="email" id="email" placeholder="Email" class="form-control" required autofocus>
                                @if ($errors->has('email'))
                                    <span class="text-danger">{{$errors->first('email')}}</span>
                                    
                                @endif
                            </div>
                            <div class="form-group mb-3">
                                <input type="password" placeholder="Password" id="password" class="form-control" name="password" required>
                                @if ($errors->has('password'))
                                    <span class="text-danger">{{$errors->first('password')}}</span>
                                    
                                @endif
                            </div>
                            <div class="d-grid mx-auto">
                                <button class="btn btn-dark btn-block">sign up</button>
                                <p>Already have an account?
                                    <a href="login">Singin</a></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </main>
@endsection