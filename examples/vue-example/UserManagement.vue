<!--
  Příklad použití firestore-helper v Vue.js aplikaci
  
  Vue verze: 3.x
  Přístup: Composition API
-->
<template>
  <div class="user-management">
    <h1>Správa uživatelů s Firestore Helper</h1>

    <!-- Chybová zpráva -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Formulář pro přidání uživatele -->
    <div class="user-form">
      <h2>Přidat nového uživatele</h2>
      <form @submit.prevent="createUser">
        <div class="form-group">
          <label for="name">Jméno:</label>
          <input
            type="text"
            id="name"
            v-model="newUser.name"
            required
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="newUser.email"
            required
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="department">Oddělení:</label>
          <select
            id="department"
            v-model="newUser.department"
            :disabled="loading"
          >
            <option value="Marketing">Marketing</option>
            <option value="Development">Vývoj</option>
            <option value="Support">Podpora</option>
            <option value="Sales">Obchod</option>
          </select>
        </div>
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? "Ukládám..." : "Přidat uživatele" }}
        </button>
      </form>
    </div>

    <!-- Seznam uživatelů -->
    <div class="user-list">
      <h2>Seznam uživatelů</h2>

      <div v-if="loading && !users.length" class="loading">
        Načítání uživatelů...
      </div>

      <p v-else-if="!users.length">Žádní uživatelé nebyli nalezeni.</p>

      <table v-else class="user-table">
        <thead>
          <tr>
            <th>Jméno</th>
            <th>Email</th>
            <th>Oddělení</th>
            <th>Stav</th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.department }}</td>
            <td>
              <span
                class="status-badge"
                :class="{
                  'status-active': user.isActive,
                  'status-inactive': !user.isActive,
                }"
              >
                {{ user.isActive ? "Aktivní" : "Neaktivní" }}
              </span>
            </td>
            <td class="actions">
              <button
                class="btn-action btn-toggle"
                @click="toggleUserStatus(user)"
                :disabled="loading"
              >
                {{ user.isActive ? "Deaktivovat" : "Aktivovat" }}
              </button>
              <button
                class="btn-action btn-delete"
                @click="deleteUser(user.id)"
                :disabled="loading"
              >
                Smazat
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from "vue";
import {
  initialize,
  get,
  create,
  update,
  removeDoc,
} from "firestore-helper-ts";

// Definice typů pro TypeScript
interface User {
  id?: string;
  name: string;
  email: string;
  department: string;
  isActive: boolean;
  createdAt?: any; // Firestore timestamp
}

export default defineComponent({
  name: "UserManagement",

  setup() {
    // Stav
    const users = ref<User[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Nový uživatel - formulářová data
    const newUser = reactive<Omit<User, "id" | "isActive" | "createdAt">>({
      name: "",
      email: "",
      department: "Development",
    });

    // Inicializace Firebase
    const initializeFirebase = () => {
      try {
        initialize({
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
          authDomain:
            import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
            "your-app.firebaseapp.com",
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-app",
          storageBucket:
            import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
            "your-app.appspot.com",
          messagingSenderId:
            import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
            "YOUR_MESSAGING_ID",
          appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
        });
      } catch (err) {
        error.value = "Chyba při inicializaci Firebase";
        console.error(err);
      }
    };

    // Načtení uživatelů
    const fetchUsers = async () => {
      loading.value = true;
      error.value = null;

      try {
        const result = await get<User[]>({
          path: "users",
          orderBy: [["createdAt", "desc"]],
          limit: 20,
        });

        if (result.error) {
          error.value = result.error.message;
        } else {
          users.value = result.data || [];
        }
      } catch (err) {
        error.value = "Chyba při načítání uživatelů";
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    // Vytvoření uživatele
    const createUser = async () => {
      loading.value = true;
      error.value = null;

      try {
        const result = await create<User>({
          path: "users",
          data: {
            ...newUser,
            isActive: true,
            createdAt: new Date(),
          },
        });

        if (result.error) {
          error.value = result.error.message;
        } else {
          // Reset formuláře
          newUser.name = "";
          newUser.email = "";
          newUser.department = "Development";

          // Načtení aktualizovaných dat
          fetchUsers();
        }
      } catch (err) {
        error.value = "Chyba při vytváření uživatele";
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    // Přepnutí stavu uživatele (aktivní/neaktivní)
    const toggleUserStatus = async (user: User) => {
      if (!user.id) return;

      loading.value = true;
      error.value = null;

      try {
        const result = await update<User>({
          path: "users",
          docId: user.id,
          data: {
            isActive: !user.isActive,
          },
        });

        if (result.error) {
          error.value = result.error.message;
        } else {
          fetchUsers();
        }
      } catch (err) {
        error.value = "Chyba při aktualizaci uživatele";
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    // Smazání uživatele
    const deleteUser = async (userId: string) => {
      if (!confirm("Opravdu chcete smazat tohoto uživatele?")) {
        return;
      }

      loading.value = true;
      error.value = null;

      try {
        const result = await removeDoc({
          path: "users",
          docId: userId,
        });

        if (result.error) {
          error.value = result.error.message;
        } else {
          fetchUsers();
        }
      } catch (err) {
        error.value = "Chyba při mazání uživatele";
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    // Inicializace při načtení komponenty
    onMounted(() => {
      initializeFirebase();
      fetchUsers();
    });

    return {
      users,
      loading,
      error,
      newUser,
      createUser,
      toggleUserStatus,
      deleteUser,
    };
  },
});
</script>

<style scoped>
.user-management {
  font-family: Arial, sans-serif;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

h2 {
  margin-top: 30px;
  margin-bottom: 15px;
  color: #444;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.user-form {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

input,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.user-table th,
.user-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.user-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary:hover {
  background-color: #1565c0;
}

.btn-primary:disabled {
  background-color: #bbdefb;
  cursor: not-allowed;
}

.btn-action {
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-toggle {
  background-color: #26a69a;
  color: white;
}

.btn-toggle:hover {
  background-color: #00897b;
}

.btn-delete {
  background-color: #e53935;
  color: white;
}

.btn-delete:hover {
  background-color: #c62828;
}

.btn-action:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 14px;
}

.status-active {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.status-inactive {
  background-color: #ffccbc;
  color: #d84315;
}

.loading {
  font-style: italic;
  color: #757575;
}
</style>
