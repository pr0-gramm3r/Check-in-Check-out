<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('head')->nullable();
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('color')->default(0);
            $table->timestamps();
        });

        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->time('start');
            $table->time('end');
            $table->unsignedSmallInteger('grace_minutes')->default(0);
            $table->json('days');
            $table->timestamps();
        });

        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'employee_id')) {
                $table->string('employee_id')->nullable()->unique()->after('email');
            }
            if (! Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('employee_id');
            }
            if (! Schema::hasColumn('users', 'department_id')) {
                $table->foreignId('department_id')->nullable()->after('phone')->constrained()->nullOnDelete();
            }
            if (! Schema::hasColumn('users', 'department')) {
                $table->string('department')->nullable()->after('department_id');
            }
            if (! Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('Employee')->after('department');
            }
            if (! Schema::hasColumn('users', 'status')) {
                $table->string('status')->default('active')->after('role');
            }
            if (! Schema::hasColumn('users', 'joined')) {
                $table->date('joined')->nullable()->after('status');
            }
            if (! Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar')->nullable()->after('joined');
            }
        });

        Schema::table('attendances', function (Blueprint $table) {
            if (! Schema::hasColumn('attendances', 'location')) {
                $table->string('location')->nullable()->after('status');
            }
            if (! Schema::hasColumn('attendances', 'notes')) {
                $table->text('notes')->nullable()->after('location');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            if (Schema::hasColumn('attendances', 'notes')) {
                $table->dropColumn('notes');
            }
            if (Schema::hasColumn('attendances', 'location')) {
                $table->dropColumn('location');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'department_id')) {
                $table->dropConstrainedForeignId('department_id');
            }

            foreach (['employee_id', 'phone', 'department', 'role', 'status', 'joined', 'avatar'] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::dropIfExists('app_settings');
        Schema::dropIfExists('shifts');
        Schema::dropIfExists('departments');
    }
};
