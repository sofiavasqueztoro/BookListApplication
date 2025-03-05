describe('Book List Prueba', () => {
    let booksFromBackend: string | any[] = [];
  
    before(() => {
      cy.request('GET', 'http://localhost:8080/api/books')
        .then((response) => {
          expect(response.status).to.eq(200);
          booksFromBackend = response.body;
          cy.log(`Se obtuvieron ${booksFromBackend.length} libros del backend`);
        });
    });
  
    beforeEach(() => {
      cy.visit('/books');
    });
  
    it('should display the book list', () => {
      cy.get('app-book-list').should('exist');
      cy.log('La página de libros cargó correctamente');
    });
  
    it('should display the correct number of books', () => {
      cy.get('div.col.mb-2')
        .should('have.length', booksFromBackend.length)
        .then(() => {
          cy.log(`Se muestran ${booksFromBackend.length} libros en la vista`);
        });
    });

    it('should have the correct number of <div.card.p-2> elements', () => {
        cy.get('div.card.p-2').should('have.length', booksFromBackend.length);
      });
  
      it('should have the correct number of <img> elements', () => {
        cy.get('img').should('have.length', booksFromBackend.length);
      });
  
      it('should have the correct number of <div.card-body> elements', () => {
        cy.get('div.card-body').should('have.length', booksFromBackend.length);
      });
  
    it('should display correct image src and alt attributes', () => {
      cy.get('img').each(($img, index) => {
        cy.wrap($img)
          .should('have.attr', 'src', booksFromBackend[index].image)
          .should('have.attr', 'alt', booksFromBackend[index].name)
          .then(() => {
            cy.log(`Imagen correcta para el libro: ${booksFromBackend[index].name}`);
          });
      });
    });
  
    it('should have h5 tag with the book.name', () => {
      cy.get('h5.card-title').each(($title, index) => {
        cy.wrap($title)
          .should('contain.text', booksFromBackend[index].name)
          .then(() => {
            cy.log(`Título correcto: ${booksFromBackend[index].name}`);
          });
      });
    });
  
    it('should have p tag with the book.editorial.name', () => {
      cy.get('p.card-text').each(($p, index) => {
        cy.wrap($p)
          .should('contain.text', booksFromBackend[index].editorial.name)
          .then(() => {
            cy.log(`Editorial correcta para el libro ${booksFromBackend[index].name}: ${booksFromBackend[index].editorial.name}`);
          });
      });
    });
  
    //No se pueden borrar libros si tiene autor asociado, lo dejo asi o lo cambio en el back?
    it('should correctly update the book list if a book is removed', () => {
      cy.request('GET', 'http://localhost:8080/api/books')
        .then((response) => {
          expect(response.status).to.eq(200);
          const books = response.body;
  
          cy.log(`Total de libros antes de eliminar: ${books.length}`);
  
          // Filtrar los libros que no tienen autores
          const bookWithoutAuthors = books.find((book: { authors: string | any[]; }) => !book.authors || book.authors.length === 0);
  
          if (!bookWithoutAuthors) {
            cy.log('No hay libros sin autores disponibles para eliminar');
            return;
          }
  
          cy.log(`Eliminando el libro: ${bookWithoutAuthors.name} (ID: ${bookWithoutAuthors.id})`);
  
          // Intentamos eliminar el libro sin autores
          cy.request({
            method: 'DELETE',
            url: `http://localhost:8080/api/books/${bookWithoutAuthors.id}`,
            failOnStatusCode: false,
          }).then((deleteResponse) => {
            expect(deleteResponse.status).to.be.oneOf([200, 204]);
  
            cy.log(`Libro eliminado con éxito: ${bookWithoutAuthors.name}`);
  
            //Verificamos que el libro ya no esté en la lista
            cy.reload();
            cy.request('GET', 'http://localhost:8080/api/books')
              .then((updatedResponse) => {
                expect(updatedResponse.status).to.eq(200);
                const updatedBooks = updatedResponse.body;
  
                cy.log(`Total de libros después de eliminar: ${updatedBooks.length}`);
  
                cy.get('div.col.mb-2').should('have.length', updatedBooks.length);
  
                // Verificar que el libro eliminado ya no está en la vista
                cy.get('div.col.mb-2').each(($book) => {
                  cy.wrap($book).should('not.contain.text', bookWithoutAuthors.name);
                });
              });
          });
        });
    });
  });
  

