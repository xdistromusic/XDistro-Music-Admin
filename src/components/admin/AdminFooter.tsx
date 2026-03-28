const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-onerpm-dark-blue border-t border-gray-800 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
          <p className="text-white/70 text-sm">
            © {currentYear} XDistro Music. All rights reserved.
          </p>          
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;