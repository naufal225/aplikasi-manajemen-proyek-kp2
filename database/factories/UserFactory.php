<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $gender = fake()->randomElement(['LAKI-LAKI', 'PEREMPUAN']) == "LAKI-LAKI" ? 'male' : 'female';

        return [
            'nama_lengkap' => fake()->name($gender),
            'username' => fake()->userName(),
            'email' => fake()->safeEmail(),
            'password' => bcrypt('password'),
            'tipe_admin' => fake()->randomElement(['admin', 'owner']),
            'jenis_kelamin' => $gender == 'male' ? "LAKI-LAKI" : 'PEREMPUAN',
            'nomor_telepon' => fake()->phoneNumber(),
            'alamat' => fake()->address(),
            'tanggal_lahir' => fake()->date($format='Y-m-d', $max=now()->subYears(17)->format('Y-m-d'))
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
