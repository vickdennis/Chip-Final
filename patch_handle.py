import re

with open('src/views/AdminDashboard.tsx', 'r') as f:
    code = f.read()

old_func = """  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await adminAuthClient.auth.signUp({
        email: newUserForm.email,
        password: newUserForm.password,
        options: {
          data: {
            full_name: newUserForm.full_name
          }
        }
      });
      if (error) {
        if (error.message && error.message.toLowerCase().includes('rate limit')) {
          alert('Sign up error: email rate limit exceeded. Please try again later.');
        } else {
          alert("Sign up error: " + error.message);
        }
      } else if (data.user) {
        // Give the trigger a moment to run
        await new Promise(r => setTimeout(r, 1000));
        
        const payload: any = {
          full_name: newUserForm.full_name,
          headline: newUserForm.headline || null,
          bio: newUserForm.bio || null,
          contact_email: newUserForm.email,
          phone_number: newUserForm.phone_number || null,
          cover_image_url: newUserForm.cover_image_url || null,
          is_verified: true
        };
        
        if (newUserForm.username) {
          payload.username = newUserForm.username;
        }
        
        // Use adminAuthClient (which now holds the new user's session) to update their profile
        const { error: innerError } = await adminAuthClient.from('profiles').update(payload).eq('id', data.user.id);
        
        // Sign out to clear the temporary session
        await adminAuthClient.auth.signOut();
        
        if (innerError) {
          alert('User created but failed to update profile details: ' + innerError.message);
        } else {
          alert("User created successfully!");
        }
        setCreatingUser(false);
        setNewUserForm({ email: '', password: '', full_name: '', username: '', headline: '', bio: '', phone_number: '', cover_image_url: '', number_of_accounts: 1 });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };"""

new_func = """  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const count = newUserForm.number_of_accounts || 1;
      const baseEmail = newUserForm.email;
      const [localPart, domainPart] = baseEmail.includes('@') ? baseEmail.split('@') : [baseEmail, ''];

      let successCount = 0;
      let lastError = null;
      let limitHit = false;

      for (let i = 0; i < count; i++) {
        const currentEmail = count === 1 ? baseEmail : `${localPart}+${i+1}@${domainPart}`;
        const currentFullName = count === 1 ? newUserForm.full_name : `${newUserForm.full_name} ${i+1}`;
        const currentUsername = count === 1 ? newUserForm.username : (newUserForm.username ? `${newUserForm.username}${i+1}` : '');

        const { data, error } = await adminAuthClient.auth.signUp({
          email: currentEmail,
          password: newUserForm.password,
          options: {
            data: {
              full_name: currentFullName
            }
          }
        });

        if (error) {
          lastError = error;
          if (error.message && error.message.toLowerCase().includes('rate limit')) {
             limitHit = true;
          }
          break;
        } else if (data.user) {
          await new Promise(r => setTimeout(r, 1000));
          
          const payload: any = {
            full_name: currentFullName,
            headline: newUserForm.headline || null,
            bio: newUserForm.bio || null,
            contact_email: currentEmail,
            phone_number: newUserForm.phone_number || null,
            cover_image_url: newUserForm.cover_image_url || null,
            is_verified: true
          };
          
          if (currentUsername) {
            payload.username = currentUsername;
          }
          
          const { error: innerError } = await adminAuthClient.from('profiles').update(payload).eq('id', data.user.id);
          
          await adminAuthClient.auth.signOut();
          
          if (innerError) {
             console.error('Failed to update profile for', currentEmail, innerError);
          } else {
             successCount++;
          }
        }
      }

      if (lastError) {
        if (limitHit) {
          alert(`Sign up error: rate limit exceeded after creating ${successCount} accounts. Try again later.`);
        } else {
          alert(`Sign up error after creating ${successCount} accounts: ${lastError.message}`);
        }
      } else {
        alert(count > 1 ? `Successfully created ${successCount} accounts!` : "User created successfully!");
      }
      
      if (successCount > 0) {
        setCreatingUser(false);
        setNewUserForm({ email: '', password: '', full_name: '', username: '', headline: '', bio: '', phone_number: '', cover_image_url: '', number_of_accounts: 1 });
        fetchData();
      }

    } catch (err) {
      console.error(err);
    }
  };"""

code = code.replace(old_func, new_func)

with open('src/views/AdminDashboard.tsx', 'w') as f:
    f.write(code)

print("Part 2 Patched")
