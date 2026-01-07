<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('attendances', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        $table->datetime('check_in')->nullable();
        $table->datetime('check_out')->nullable();
        
        // Optional: track status (e.g., 'present', 'late')
        $table->string('status')->default('active'); 
        
        $table->timestamps(); // Adds created_at and updated_at
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }

    
};
