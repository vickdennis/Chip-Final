const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');

const oldImageRender = `                  {currentLink.image_url ? (
                    <img src={currentLink.image_url} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}`;

const newImageRender = `                  {currentLink.image_url ? (
                    <img src={currentLink.image_url} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : currentLink.use_link_icon && currentLink.url ? (
                    <img src={\`https://icon.horse/icon/\${(currentLink.url.replace(/^https?:\\/\\//, '').split('/')[0])}\`} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}`;

code = code.replace(oldImageRender, newImageRender);
fs.writeFileSync('src/views/UserDashboard.tsx', code);
